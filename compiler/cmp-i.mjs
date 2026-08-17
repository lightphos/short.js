#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch, existsSync } from 'fs';
import { resolve, basename, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..'); // assume cmp/ is inside project root
const ext = ".jsx";
const jsxExtension = /\.jsx$/i;

function compile(sxSource) {
  let html = sxSource;
  // 1. Fix <style src="..."> -> <link rel="stylesheet" href="...">
//  html = html.replace(/<style\s+src=["']([^"']+)["']\s*>\s*<\/style>/, '<link rel="stylesheet" href="$1">');

  // 2. Add module with cmp() and replacement logic
//  html += ``;

  // 3. Ensure proper HTML structure if missing
  if (!html.includes('<!DOCTYPE')) {
    html = '<!-- Short.js: compiled from '+ext+' -->\n';
  }

  return html;
}

function parseAttributes(attributeText) {
    const attrs = {};

    const attributePattern =
        /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

    for (const match of attributeText.matchAll(attributePattern)) {
        const [, name, doubleValue, singleValue, bareValue] = match;

        attrs[name] =
            doubleValue ??
            singleValue ??
            bareValue ??
            true;
    }

    return attrs;
}

function renderComponent(sh, components, name, attr = '') {        
    const component = components[name];

    console.log(name + ":" + attr)
    if (typeof component !== 'function') {
        console.log(
            `Unknown component: <${name}></${name}>`            );
        return    
    }

    const attrs = parseAttributes(attr);

    return component(sh, attrs);
}

function renderIt(sh, components, source, script) {
    const pattern = /<([A-Za-z][\w-]*)([^>]*?)(?:\/\s*>|>\s*<\/\1\s*>)/g;
    const output = source.replace(script, '')
    .replace(
        pattern,
        (match, name, attr) => {
            if (!Object.hasOwn(components, name)) {
                return match;
            }

            return renderComponent(sh, components, name, attr);
        }
        
    );
    return output;
}

async function runScript(inputPath, source) {

    const scriptMatch = source.match(
      /<short(?:\s[^>]*)?>([\s\S]*?)<\/short>/i
    );

    if (!scriptMatch) {
      throw new Error('No <short> block found');
    }

    const scriptCode = scriptMatch[1].trim();

    const fnNames = [
      ...scriptCode.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)
    ].map(m => m[1]);

    // Optional: also support arrow functions assigned to const/let
    // const arrowNames = [...scriptCode.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g)].map(m => m[1]);
    // const allNames = [...new Set([...fnNames, ...arrowNames])];

    if (fnNames.length === 0) {
      throw new Error('No component functions found inside <short>');
    }

    const wrappedCode = `
      ${scriptCode}

      return { ${fnNames.join(', ')} };
    `;

    const shortUrl = new URL('../short.js', import.meta.url);
    const sh = await import(shortUrl);
    const context = vm.createContext({
        console
    });

    const script = new vm.Script(
            `(function () {
                ${wrappedCode}         
            })()`, {
        filename: inputPath
    });

    const components = script.runInContext(context);

    const result = renderIt(sh, components, source, scriptMatch[0])
    const result2 = renderIt(sh, components, result, scriptMatch[0])

    // mkdirSync('./dist', { recursive: true });

    return result;
}

// ──────────────────────────────────────────────
// Compile a single file
// ──────────────────────────────────────────────
async function compileFile(inputPath) {
  const outputPath = inputPath.replace(jsxExtension, '.html');

  try {
    const source = readFileSync(inputPath, 'utf8');
    const rs = await runScript(inputPath, source)
    const compiled = compile(rs);
    writeFileSync(outputPath, compiled, 'utf8');
    console.log(`✓ ${basename(inputPath)} → ${basename(outputPath)}`);
  } catch (err) {
    console.error(`✗ Failed to compile ${basename(inputPath)}:`, err.message);
  }
}

// ──────────────────────────────────────────────
// Find all .st files recursively
// ──────────────────────────────────────────────
function findStFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and hidden folders
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      findStFiles(full, files);
    } else if (extname(entry.name).toLowerCase() === '.jsx') {
      files.push(full);
    }
  }
  return files;
}

// ──────────────────────────────────────────────
// Build all .st files
// ──────────────────────────────────────────────
async function buildAll() {
  const files = findStFiles(projectRoot);
  if (files.length === 0) {
    console.log('No '+ext+' files found.');
    return;
  }
  console.log(`Building ${files.length} file(s)...`);
  files.forEach(await compileFile);
}

// ──────────────────────────────────────────────
// Watch mode
// ──────────────────────────────────────────────
async function startWatch() {
  console.log('👀 Watching for '+ext+' file changes... (Ctrl+C to stop)\n');
  buildAll(); // initial build

  // Watch the whole project recursively
  watch(projectRoot, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.toLowerCase().endsWith(ext)) return;

    const fullPath = resolve(projectRoot, filename);
    // small debounce
    clearTimeout(startWatch._timer);
    startWatch._timer = setTimeout(() => {
      compileFile(fullPath);
    }, 100);
  });
}

// ──────────────────────────────────────────────
// CLI
// ──────────────────────────────────────────────
const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || args.includes('-w');

if (isWatch) {
  await startWatch();
} else if (args.length > 0 && !args[0].startsWith('-')) {
  // single file mode: node cmp/cmp.mjs path/to/file.st
  await compileFile(resolve(args[0]));
} else {
  // default: build all
  await buildAll();
}
