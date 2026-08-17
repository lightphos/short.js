#!/usr/bin/env node

import {
  readFile,
  writeFile,
  readdir,
  watch,
} from 'node:fs/promises';

import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import {
  parseFragment,
  parse as parseHtml,
  serialize,
} from 'parse5';

import {
  parse as parseJavaScript,
} from '@babel/parser';

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
    sourceType: 'script',
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

  const fnN = functionNames.join(', ');
  console.log("Cd: " +code)
  const wrappedCode = `
    ${code}
    return { ${fnN} };
  `;

  console.log('WRAPPED')
  console.log(functionNames)
  console.log(wrappedCode)
  return {
    ast,
    wrappedCode,
  };
}

function attributesToObject(attributes = []) {
  return Object.fromEntries(
    attributes.map(({ name, value }) => [
      name,
      value === '' ? true : value,
    ])
  );
}

function createRenderer(components, sh) {
  const rendering = [];

  function renderComponent(name, attrs) {
    const component =
      components[name];

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
      const result = component(sh, attrs);

      if (typeof result !== 'string') {
        throw new TypeError(
          `Component "${name}" must return an HTML string`
        );
      }

      return parseFragment(result);
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
  const {
    wrappedCode,
  } = parseComponentScript(
    code,
    inputPath
  );

  const context = vm.createContext({
    console,
  });

  const script = new vm.Script(
    `(function () {
        ${wrappedCode}
      })()
    `,
    {
      filename: inputPath,
    }
  );

  const components =
    script.runInContext(context);

  if (
    !components ||
    typeof components !== 'object'
  ) {
    throw new TypeError(
      'The <short> block must define a component object or functions'
    );
  }

  for (
    const [name, component] of
    Object.entries(components)
  ) {
    if (typeof component !== 'function') {
      throw new TypeError(
        `Component "${name}" must be a function`
      );
    }
  }

  return components;
}

async function renderSource(source, inputPath) {
  const {
    fullBlock,
    code,
  } = parseShortBlock(
    source,
    inputPath
  );

  const components =
    await loadComponents(
      code,
      inputPath
    );

  const sh = await import(
    new URL('../short.js', import.meta.url)
  );

  const document =
    parseHtml(
      source.replace(fullBlock, '')
    );

  const renderer =
    createRenderer(
      components,
      sh
    );

  renderer.renderChildren(document);

  return serialize(document);
}

function addCompilerComment(html) {
  if (
    /<!doctype\s+html>/i.test(html)
  ) {
    return html;
  }

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
    const source =
      await readFile(
        inputPath,
        'utf8'
      );

    const compiled =
      addCompilerComment(
        await renderSource(
          source,
          inputPath
        )
      );

    await writeFile(
      outputPath,
      compiled,
      'utf8'
    );

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
      error.message
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