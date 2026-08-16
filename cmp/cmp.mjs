#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// CLI
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node compiler.mjs <file.st> [file.html]');
        process.exit(1);
    }

    const inputPath = resolve(args[0]);
    const outputPath = args[1] ? resolve(args[1]) : inputPath.replace(/\.st$/i, '.html');

    const source = readFileSync(inputPath, 'utf8');
    const rs = await runScript(inputPath, source)

    const compiled = compile(rs);

    writeFileSync(outputPath, compiled, 'utf8');
    console.log('✓ Compiled ' + basename(inputPath) + ' -> ' + basename(outputPath));
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});