#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch, existsSync, unlinkSync } from 'fs';
import { resolve, basename, relative, dirname, extname, join } from 'path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

let projectRoot = process.cwd();

console.log(`short.js compiler running from ${projectRoot}`);

function replaceInterpolations(source, replace) {
  let output = '';
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf('${', cursor);
    if (start === -1) {
      output += source.slice(cursor);
      break;
    }

    output += source.slice(cursor, start);

    let end = start + 2;
    let depth = 0;
    let quote = null;
    let escaped = false;

    for (; end < source.length; end += 1) {
      const char = source[end];

      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === quote) {
          quote = null;
        }
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '(' || char === '[' || char === '{') {
        depth += 1;
      } else if (char === '}') {
        if (depth === 0) break;
        depth -= 1;
      } else if ((char === ')' || char === ']') && depth > 0) {
        depth -= 1;
      }
    }

    if (end === source.length || depth !== 0) {
      output += source.slice(start);
      break;
    }

    const expression = source.slice(start + 2, end);
    output += replace(source.slice(start, end + 1), expression);
    cursor = end + 1;
  }

  return output;
}

function maskTemplateStrings(source) {
  let output = '';
  let quote = null;
  let escaped = false;

  for (const char of source) {
    if (quote === '`') {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '`') {
        quote = null;
      }
      output += char === '\n' ? '\n' : ' ';
      continue;
    }

    if (char === '`') {
      quote = '`';
      output += ' ';
    } else {
      output += char;
    }
  }

  return output;
}

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
    while ((m2 = importRe.exec(maskTemplateStrings(scriptCode))) !== null) {
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
                const parts = [objContent, ...newNames].filter(Boolean);
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

    // Build case-insensitive component lookup (jsdom lowercases tag names)
    const componentLookup = {};
    for (const key of Object.keys(components)) {
        componentLookup[key.toLowerCase()] = components[key];
    }

    // Extract variable names from the return statement for interpolation
    const returnMatch = scriptCode.match(/return\s*\{([^}]*)\}/);
    const varNames = returnMatch ? returnMatch[1].split(',').map(n => n.trim()).filter(Boolean) : [];

    // Evaluate ${...} interpolations, storing real values for attribute passing
    const interpValues = {};
    let processedSource = source;
    if (varNames.length > 0) {
      processedSource = replaceInterpolations(processedSource, (match, expr) => {
            try {
                const fn = new Function(...varNames, `return (${expr})`);
                const result = fn(...varNames.map(n => components[n]));
                const key = `__interp_${Object.keys(interpValues).length}`;
                interpValues[key] = result;
                return key;
            } catch (e) {
                return match;
            }
        });
    }

    // Remove the script tag so jsdom doesn't try to parse it
    const bodyHtml = processedSource.replace(scriptMatch[0], '');

    // Parse with jsdom for proper HTML handling
    const dom = new JSDOM(bodyHtml);
    const document = dom.window.document;

    // Recursively replace custom component tags with their rendered HTML
    function processNode(node) {
        // Walk backwards so we can replace children in place without affecting iteration
        const children = Array.from(node.childNodes);
        for (const child of children) {
            if (child.nodeType === 1) { // element
                // Resolve interpolation placeholders in all attributes.
                // Non-primitive props must remain values, so they are stored on the DOM
                // element itself instead of being coerced into string attributes.
                for (const attr of child.attributes) {
                    if (attr.value in interpValues) {
                        const actual = interpValues[attr.value];
                      if (actual !== null && (typeof actual === 'function' || typeof actual === 'object')) {
                            child[attr.name] = actual;
                        } else {
                            attr.value = actual;
                        }
                    }
                }
                const tagName = child.tagName.toLowerCase();
                const componentFn = componentLookup[tagName];
                if (typeof componentFn === 'function' || typeof componentFn === 'string') {
                    // Get attributes. Preserve function-valued props from the element
                    // instance rather than from the DOM attribute string.
                    const attrs = {};
                    for (const attr of child.attributes) {
                        let val = child[attr.name];
                        if (typeof val === 'undefined') {
                            val = attr.value;
                        }
                        if (val in interpValues) {
                            val = interpValues[val];
                        }
                        attrs[attr.name] = val;
                    }
                    // Render the component (passing sh as first arg)
                    const rendered = typeof componentFn === 'function'
                        ? componentFn({ sh, ...attrs })
                        : componentFn;
                    // Parse the rendered HTML and replace the element
                    const tmpDoc = new JSDOM('');
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
            } else if (child.nodeType === 3) { // text node
                const text = child.textContent;
                const keys = Object.keys(interpValues);
                if (keys.length > 0 && keys.some(k => text.includes(k))) {
                    const parent = child.parentNode;
                    const escapedKeys = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                    const re = new RegExp(escapedKeys.join('|'), 'g');
                    const fragment = parent.ownerDocument.createDocumentFragment();
                    let lastIndex = 0;
                    let m;
                    while ((m = re.exec(text)) !== null) {
                        if (m.index > lastIndex) {
                            fragment.appendChild(parent.ownerDocument.createTextNode(text.slice(lastIndex, m.index)));
                        }
                        const actual = interpValues[m[0]];
                        if (typeof actual === 'function') {
                            fragment.appendChild(parent.ownerDocument.createTextNode(String(actual)));
                        } else if (typeof actual === 'string' && /<script\b/i.test(actual)) {
                            const script = parent.ownerDocument.createElement('script');
                            const match = actual.match(/<script\b([^>]*)>([\s\S]*?)<\/script>/i);
                            if (match) {
                                if (match[1]) {
                                    const attrs = match[1];
                                    const typeMatch = attrs.match(/\btype\s*=\s*['"]([^'"]+)['"]/i);
                                    if (typeMatch) script.type = typeMatch[1];
                                }
                                script.textContent = match[2] || '';
                            } else {
                                script.textContent = actual;
                            }
                            fragment.appendChild(script);
                        } else if (typeof actual === 'string' && /<[a-z]/i.test(actual)) {
                            const tmp = parent.ownerDocument.createElement('div');
                            tmp.innerHTML = actual;
                            while (tmp.firstChild) {
                                fragment.appendChild(tmp.firstChild);
                            }
                        } else {
                            fragment.appendChild(parent.ownerDocument.createTextNode(String(actual)));
                        }
                        lastIndex = re.lastIndex;
                    }
                    if (lastIndex < text.length) {
                        fragment.appendChild(parent.ownerDocument.createTextNode(text.slice(lastIndex)));
                    }
                    parent.replaceChild(fragment, child);
                }
            } else {
                processNode(child);
            }
        }
    }

    processNode(document);

    return dom.serialize();
}

// ──────────────────────────────────────────────
// Compile a single file
// ──────────────────────────────────────────────
async function compileFile(inputPath, outDir) {
  const relPath = relative(projectRoot, inputPath).replace(/\.st$/i, '.html');
  const outputPath = outDir ? join(outDir, relPath) : relPath;
  mkdirSync(dirname(outputPath), { recursive: true });

  if (inputPath.endsWith('.short')) {
    return;
  }

  //  console.log(`Compiling ${relative(projectRoot, inputPath)} → ${outputPath} ...`);
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
  // console.log(`Building ${files.length} file(s)...`);
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
    if (!filename) {
      return;
    }

    if (!filename.toLowerCase().endsWith('.st') &&
        !filename.toLowerCase().endsWith('.js')) {
      return;
    }

    // console.log(`Detected ${eventType} in ${filename}, recompiling...`);
    const fullPath = resolve(projectRoot, filename);
    // small debounce
    clearTimeout(startWatch._timer);
    startWatch._timer = setTimeout(async () => {
      if (filename.toLowerCase().endsWith('.js')) {
        // Recompile all .st files that might import this .js
        await buildAll(outDir);
      } else {
        // console.log(`Detected change in ${fullPath}, recompiling...`);
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

// Parse --root <dir>
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--root' || args[i] === '-r') && args[i + 1] && !args[i + 1].startsWith('-')) {
    projectRoot = resolve(args[i + 1]);
    args.splice(i, 2); // remove so they don't get treated as positional
    i--;
  }
}

// Parse --out / -o <dir>
let outDir = '.short';
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--out' || args[i] === '-o') && args[i + 1] && !args[i + 1].startsWith('-')) {
    outDir = resolve(projectRoot, args[i + 1]);
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
  await compileFile(resolve(projectRoot, positionalArgs[0]), outDir);
} else {
  // default: build all
  await buildAll(outDir);
}
