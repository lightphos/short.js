#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch, existsSync, unlinkSync } from 'fs';
import { resolve, basename, relative, dirname, extname, join } from 'path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..'); // assume cmp/ is inside project root

function compile(sxSource) {
  let html = sxSource;
  // 1. Fix <style src="..."> -> <link rel="stylesheet" href="...">
  html = html.replace(/<style\s+src=["']([^"']+)["']\s*>\s*<\/style>/gi, '<link rel="stylesheet" href="$1">');

  // 2. Ensure proper HTML structure if missing
  if (!html.includes('<!DOCTYPE')) {
//    html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Compiled from .st</title>\n</head>\n<body>\n' + html + '\n</body>\n</html>';
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

    // Extract imported names so we can include them in the export
    const importRe = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
    const importNames = [];
    let m2;
    while ((m2 = importRe.exec(scriptCode)) !== null) {
        const names = m2[1].split(',').map(n => n.trim());
        importNames.push(...names);
    }

    let modifiedCode = scriptCode.replace(
        /(?:\breturn\s*|export\s+default\s+)({[\s\S]*?})\s*;?\s*$/,
        (_, returnObj) => {
            if (importNames.length > 0) {
                // Add only import names that are NOT already in the return object
                const objContent = returnObj.replace(/^\{|\}$/g, '').trim();
                const existingNames = objContent.split(',').map(n => n.trim());
                const newNames = importNames.filter(n => !existingNames.includes(n));
                const parts = [objContent, ...newNames];
                return `export default { ${parts.join(', ')} };`;
            }
            return `export default ${returnObj};`;
        }
    );

    // Write to a temp .mjs file in the same directory as the .st file
    // so relative imports (e.g. './app.js') resolve correctly
    const dir = dirname(inputPath);
    const tmpName = `.cmp-tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`;
    const tmpPath = join(dir, tmpName);

    let components;
    try {
        writeFileSync(tmpPath, modifiedCode, 'utf8');
        const mod = await import(pathToFileURL(tmpPath).href);
        components = mod.default;
    } finally {
        try { unlinkSync(tmpPath); } catch {}
    }

    // Remove the script tag so jsdom doesn't try to parse it
    const bodyHtml = source.replace(scriptMatch[0], '');

    // Parse with jsdom for proper HTML handling
    const dom = new JSDOM(bodyHtml);
    const document = dom.window.document;

    // Recursively replace custom component tags with their rendered HTML
    function processNode(node) {
        // Walk backwards so we can replace children in place without affecting iteration
        const children = Array.from(node.childNodes);
        for (const child of children) {
            if (child.nodeType === 1) { // element
                const tagName = child.tagName.toLowerCase();
                if (typeof components[tagName] === 'function') {
                    // Get attributes
                    const attrs = {};
                    for (const attr of child.attributes) {
                        attrs[attr.name] = attr.value;
                    }
                    // Render the component (passing sh as first arg)
                    const rendered = components[tagName]({ sh, ...attrs });
                    // Parse the rendered HTML and replace the element
                    const tmpDoc = new JSDOM('');
                    const frag = tmpDoc.window.document.createDocumentFragment();
                    const tmpBody = tmpDoc.window.document.body;
                    tmpBody.innerHTML = rendered;
                    // Process recursively
                    processNode(tmpBody);
                    // Replace the child with rendered content
                    const parent = child.parentNode;
                    while (tmpBody.firstChild) {
                        parent.insertBefore(tmpBody.firstChild, child);
                    }
                    parent.removeChild(child);
                } else {
                    processNode(child);
                }
            }
        }
    }

    processNode(document.body);

    return dom.serialize();
}

// ──────────────────────────────────────────────
// Compile a single file
// ──────────────────────────────────────────────
async function compileFile(inputPath, outDir) {
  const relPath = relative(projectRoot, inputPath).replace(/\.st$/i, '.html');
  const outputPath = outDir ? join(outDir, relPath) : relPath;
  mkdirSync(dirname(outputPath), { recursive: true });

  console.log(`Compiling ${relative(projectRoot, inputPath)} → ${outputPath} ...`);
  try {
    const source = readFileSync(inputPath, 'utf8');
    const rs = await runScript(inputPath, source);
    const compiled = compile(rs);
    writeFileSync(outputPath, compiled, 'utf8');
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
async function buildAll(outDir) {
  const files = findStFiles(projectRoot);
  if (files.length === 0) {
    console.log('No .st files found.');
    return;
  }
  console.log(`Building ${files.length} file(s)...`);
  for (const f of files) {
    await compileFile(f, outDir);
  }
}

// ──────────────────────────────────────────────
// Watch mode
// ──────────────────────────────────────────────
async function startWatch(outDir) {
  console.log('👀 Watching for .st file changes... (Ctrl+C to stop)\n');
  buildAll(outDir); // initial build

  // Watch the whole project recursively
  watch(projectRoot, { recursive: true }, (eventType, filename) => {
    if (!filename.toLowerCase().endsWith('.st') &&
        !filename.toLowerCase().endsWith('.js')) {
      return;
    }

    const fullPath = resolve(projectRoot, filename);
    // small debounce
    clearTimeout(startWatch._timer);
    startWatch._timer = setTimeout(async () => {
      if (filename.toLowerCase().endsWith('.js')) {
        // Recompile all .st files that might import this .js
        await buildAll(outDir);
      } else {
        compileFile(fullPath, outDir);
      }
    }, 100);
  });
}

// ──────────────────────────────────────────────
// CLI
// ──────────────────────────────────────────────
const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || args.includes('-w');

// Parse --out / -o <dir>
let outDir = null;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--out' || args[i] === '-o') && args[i + 1] && !args[i + 1].startsWith('-')) {
    outDir = resolve(args[i + 1]);
    args.splice(i, 2); // remove so they don't get treated as positional
    i--;
  }
}

// Strip --watch / -w from args used for positional checks
const positionalArgs = args.filter(a => a !== '--watch' && a !== '-w');

if (isWatch) {
  await startWatch(outDir);
} else if (positionalArgs.length > 0 && !positionalArgs[0].startsWith('-')) {
  // single file mode: node cmp/cmp.mjs path/to/file.st
  await compileFile(resolve(positionalArgs[0]), outDir);
} else {
  // default: build all
  await buildAll(outDir);
}
