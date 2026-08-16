#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch, existsSync } from 'fs';
import { resolve, basename, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..'); // assume cmp/ is inside project root

function compile(sxSource) {
  let html = sxSource;
  // 1. Fix <style src="..."> -> <link rel="stylesheet" href="...">
//  html = html.replace(/<style\s+src=["']([^"']+)["']\s*>\s*<\/style>/, '<link rel="stylesheet" href="$1">');

  // 2. Add module with cmp() and replacement logic
//  html += ``;

  // 3. Ensure proper HTML structure if missing
  if (!html.includes('<!DOCTYPE')) {
    html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Compiled from .st</title>\n</head>\n<body>\n' + html + '\n</body>\n</html>';
  }

  return html;
}


async function runScript(inputPath, source) {

    const scriptMatch = source.match(
      /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i
    );

    const scriptCode = scriptMatch[1];

    const shortUrl = new URL('../short.js', import.meta.url);
    const sh = await import(shortUrl);
    const context = vm.createContext({
        console
    });

    const script = new vm.Script(
            `(function () {
                ${scriptCode}         
            })()`, {
        filename: inputPath
    });

    const components = script.runInContext(context);
    function renderComponent(name) {        
        const component = components[name];

        if (typeof component !== 'function') {
            console.log(
                `Unknown component: <${name}></${name}>`            );
            return    
        }

        return component(sh);
    }

    const pattern = /<([A-Za-z][\w-]*)(?:\s*\/\s*>|\s*>\s*<\/\1\s*>)/g;
    const output = source.replace(scriptMatch[0], '')
    .replace(
        pattern,
        (match, name) => renderComponent(name)
    );

    const ot = output.replace(
        pattern,
        (match, name) => renderComponent(name)
    );

    // console.log(ot);
    // mkdirSync('./dist', { recursive: true });

    // const outputPath = inputPath.replace(/\.st$/i, '.html');

    // console.log(outputPath);
    // writeFileSync(
    //     outputPath,
    //     ot,
    //     'utf8'
    // );
    return ot;
}

// ──────────────────────────────────────────────
// Compile a single file
// ──────────────────────────────────────────────
async function compileFile(inputPath) {
  const outputPath = inputPath.replace(/\.st$/i, '.html');

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
    } else if (extname(entry.name).toLowerCase() === '.st') {
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
    console.log('No .st files found.');
    return;
  }
  console.log(`Building ${files.length} file(s)...`);
  files.forEach(await compileFile);
}

// ──────────────────────────────────────────────
// Watch mode
// ──────────────────────────────────────────────
async function startWatch() {
  console.log('👀 Watching for .st file changes... (Ctrl+C to stop)\n');
  buildAll(); // initial build

  // Watch the whole project recursively
  watch(projectRoot, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.toLowerCase().endsWith('.st')) return;

    const fullPath = resolve(projectRoot, filename);
    // small debounce
    clearTimeout(startWatch._timer);
    startWatch._timer = setTimeout(() => {
      console.log(`\n↻ Change detected: ${filename}`);
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
