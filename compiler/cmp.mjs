#!/usr/bin/env node

import {
  readFile,
  writeFile,
  readdir,
  watch,
  unlink,
} from 'node:fs/promises';

import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  parseFragment,
  parse as parseHtml,
  serialize,
} from 'parse5';

import {
  parse as parseJavaScript,
} from '@babel/parser';

import { transformSync } from '@babel/core';
import { renderToStaticMarkup } from 'react-dom/server';
import traverseModule from '@babel/traverse';

const traverse =
  traverseModule.default ?? traverseModule;

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const projectRoot =
  path.resolve(__dirname, '..');

const SOURCE_EXTENSION = '.jsx';
const OUTPUT_EXTENSION = '.html';

const SHORT_TAG_PATTERN =
  /<short(?:\s[^>]*)?>([\s\S]*?)<\/short>/i;

function parseShortBlock(source, inputPath) {
  const match = source.match(SHORT_TAG_PATTERN);

  if (!match) {
    throw new Error(
      `No <short> block found in ${inputPath}`
    );
  }

  const code = match[1].trim();

  if (!code) {
    throw new Error(
      `The <short> block is empty in ${inputPath}`
    );
  }

  return {
    fullBlock: match[0],
    code,
  };
}


function parseComponentScript(code, inputPath) {
  const ast = parseJavaScript(code, {
    sourceType: 'module',
    sourceFilename: inputPath,
    errorRecovery: false,
    plugins: ['jsx'],
  });

  const functionNames = [];
  const componentObjectNames = new Set();

  traverse(ast, {
    FunctionDeclaration(nodePath) {
      const name =
        nodePath.node.id?.name;

      if (name) {
        functionNames.push(name);
      }
    },

    VariableDeclarator(nodePath) {
      const node = nodePath.node;

      const isFunction =
        node.init &&
        [
          'FunctionExpression',
          'ArrowFunctionExpression',
        ].includes(node.init.type);

      if (
        node.id.type === 'Identifier' &&
        isFunction
      ) {
        functionNames.push(node.id.name);
      }

      if (
        node.id.type === 'Identifier' &&
        node.init?.type === 'ObjectExpression'
      ) {
        for (const property of node.init.properties) {
          if (
            property.type !== 'ObjectMethod' &&
            property.type !== 'ObjectProperty'
          ) {
            continue;
          }

          const name =
            property.key?.name ??
            property.key?.value;

          if (typeof name === 'string') {
            componentObjectNames.add(name);
          }
        }

        componentObjectNames.add(node.id.name);
      }
    },
  });

  const names = [
    ...new Set([
      ...functionNames,
      ...componentObjectNames,
    ]),
  ];

  if (names.length === 0) {
    throw new Error(
      `No component functions or component object found in ${inputPath}`
    );
  }

  const objectEntries = names
    .filter((name) => name !== 'components')
    .map(
      (name) =>
        `${JSON.stringify(name)}:
          typeof ${name} !== 'undefined'
            ? ${name}
            : undefined`
    )
    .join(',');

  
  // const wrappedCode = `
  //   ${code}
  //   return { ${fnN} };
  // `;


  const exportNames = [...new Set(functionNames)];
  // return {
  //   ast,
  //   wrappedCode,
  // };
  return { exportNames };
}

function attributesToObject(attributes = []) {
  return Object.fromEntries(
    attributes.map(({ name, value }) => [
      name,
      value === '' ? true : value,
    ])
  );
}

function createRenderer(components) {
  const rendering = [];

  function renderComponent(name, attrs) {
    const component = components[name];

    if (typeof component !== 'function') {
      return null;
    }

    if (rendering.includes(name)) {
      throw new Error(
        `Circular component reference: ${
          [...rendering, name].join(' -> ')
        }`
      );
    }

    rendering.push(name);

    try {
      const result = component(attrs);

      let html;

      if (typeof result === 'string') {
        html = result;
      } else {
        // real React element / JSX result
        html = renderToStaticMarkup(result);
      }

      return parseFragment(html);
    } finally {
      rendering.pop();
    }
  }

  function renderChildren(parent) {
    if (!parent.childNodes) {
      return;
    }

    for (
      let index = 0;
      index < parent.childNodes.length;
      index += 1
    ) {
      const node =
        parent.childNodes[index];

      const name = node.tagName;

      if (
        name &&
        Object.hasOwn(components, name)
      ) {
        const replacement =
          renderComponent(
            name,
            attributesToObject(node.attrs)
          );

        parent.childNodes.splice(
          index,
          1,
          ...replacement.childNodes
        );

        index +=
          replacement.childNodes.length - 1;

        continue;
      }

      renderChildren(node);
    }
  }

  return {
    renderChildren,
  };
}

async function loadComponents(code, inputPath) {
  const { exportNames } = parseComponentScript(code, inputPath);

  // Turn JSX → React.createElement / jsx() calls
  const transformed = transformSync(code, {
    filename: inputPath,
    presets: [
      ['@babel/preset-react', {
        runtime: 'automatic',   // no need for `import React` in every short block
      }],
    ],
    babelrc: false,
    configFile: false,
  }).code;

  // Sibling temp file → relative imports resolve against the .jsx file
  const tempPath = path.join(
    path.dirname(inputPath),
    `.short-tmp-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`
  );

  const moduleCode = `${transformed}

  export { ${exportNames.join(', ')} };
`;

  try {
    await writeFile(tempPath, moduleCode, 'utf8');

    const mod = await import(pathToFileURL(tempPath).href);

    const components = {};
    for (const name of exportNames) {
      if (typeof mod[name] === 'function') {
        components[name] = mod[name];
      }
    }

    if (Object.keys(components).length === 0) {
      throw new TypeError(
        'The <short> block must define at least one component function'
      );
    }

    return components;
  } finally {
    try {
      await unlink(tempPath);
    } catch {
      // ignore cleanup errors
    }
  }
}

async function renderSource(source, inputPath) {
  const { fullBlock, code, } = parseShortBlock(source, inputPath);

  const components = await loadComponents(code, inputPath);

  const document = parseHtml(source.replace(fullBlock, ''));

  const renderer = createRenderer(components);

  renderer.renderChildren(document);

  return serialize(document);
}

function addCompilerComment(html) {
  return (
    `<!-- Short.js: compiled from ${
      SOURCE_EXTENSION
    } -->\n` +
    html
  );
}

async function compileFile(inputPath) {
  const parsed =
    path.parse(inputPath);

  if (
    parsed.ext.toLowerCase() !==
    SOURCE_EXTENSION
  ) {
    return;
  }

  const outputPath =
    path.join(
      parsed.dir,
      `${parsed.name}${OUTPUT_EXTENSION}`
    );

  try {
    const source = await readFile(inputPath, 'utf8');

    const compiled = addCompilerComment(await renderSource(
          source,
          inputPath
        ));

    await writeFile(outputPath, compiled, 'utf8');

    console.log(
      `✓ ${path.basename(inputPath)} → ${
        path.basename(outputPath)
      }`
    );
  } catch (error) {

    console.error(
      `✗ Failed to compile ${
        path.basename(inputPath)
      }:`,
      error
    );
  }
}

async function findSourceFiles(
  dir,
  files = []
) {
  const entries =
    await readdir(
      dir,
      { withFileTypes: true }
    );

  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name.startsWith('.')
    ) {
      continue;
    }

    const fullPath =
      path.join(
        dir,
        entry.name
      );

    if (entry.isDirectory()) {
      await findSourceFiles(
        fullPath,
        files
      );
    } else if (
      path.extname(entry.name).toLowerCase() ===
      SOURCE_EXTENSION
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildAll() {
  const files =
    await findSourceFiles(
      projectRoot
    );

  if (files.length === 0) {
    console.log(
      `No ${SOURCE_EXTENSION} files found.`
    );
    return;
  }

  console.log(
    `Building ${files.length} file(s)...`
  );

  await Promise.all(
    files.map(compileFile)
  );
}

async function startWatch() {
  await buildAll();

  console.log(
    `👀 Watching for ${
      SOURCE_EXTENSION
    } file changes... (Ctrl+C to stop)\n`
  );

  let timer;

  for await (
    const event of watch(
      projectRoot,
      { recursive: true }
    )
  ) {
    const filename =
      event.filename?.toString();

    if (
      !filename ||
      path.extname(filename).toLowerCase() !==
        SOURCE_EXTENSION
    ) {
      continue;
    }

    clearTimeout(timer);

    timer = setTimeout(() => {
      compileFile(
        path.resolve(
          projectRoot,
          filename
        )
      );
    }, 100);
  }
}

const args =
  process.argv.slice(2);

const isWatch =
  args.includes('--watch') ||
  args.includes('-w');

if (isWatch) {
  await startWatch();
} else if (
  args[0] &&
  !args[0].startsWith('-')
) {
  await compileFile(
    path.resolve(args[0])
  );
} else {
  await buildAll();
}