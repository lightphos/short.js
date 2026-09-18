#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, watch as watchFiles } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const args = process.argv.slice(2);
const cwd = process.cwd();
const cliDir = dirname(fileURLToPath(import.meta.url));

function printHelp() {
  console.log(`short CLI
Usage:
  short [<path-to-.short-or-dir>] [options]
  node ./cli.mjs [<path-to-.short-or-dir>] [options]

Options:
  -r, --root <dir>   Source root (default: current directory)
  -o, --out <dir>    Output directory (default: .short in dev mode)
  -p, --port <port>  Server port (default: PORT or 3000)
  -s, --serve        Serve the target after compiling it
  -h, --help         Show this help

With no target, starts development mode for --root, watches for changes,
and serves the generated files. With a .short file or directory as the
target, compiles once; add --serve to serve the result.

Examples:
  short
  short --root app --out .short --port 3000
  short ./site.short --out ./dist
  short ./site.short --out ./dist --serve
  short ./app --out ./dist --serve
`);
}

function parseArgs(inputArgs) {
  const opts = {
    serve: false,
    port: Number(process.env.PORT || 3000),
    root: cwd,
    out: null,
  };
  const positional = [];

  for (let i = 0; i < inputArgs.length; i += 1) {
    const arg = inputArgs[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--serve' || arg === '-s') {
      opts.serve = true;
    } else if (arg === '--root' || arg === '-r') {
      if (i + 1 >= inputArgs.length) throw new Error('Missing value for --root');
      opts.root = resolve(cwd, inputArgs[++i]);
    } else if (arg === '--out' || arg === '-o') {
      if (i + 1 >= inputArgs.length) throw new Error('Missing value for --out');
      opts.out = inputArgs[++i];
    } else if (arg === '--port' || arg === '-p') {
      if (i + 1 >= inputArgs.length) throw new Error('Missing value for --port');
      opts.port = Number(inputArgs[++i]);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 1) {
    throw new Error('Expected at most one target path');
  }

  return {
    ...opts,
    out: opts.out ? resolve(opts.root, opts.out) : null,
    dev: positional.length === 0,
    target: positional[0] || '.',
  };
}

function isDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function findCompiler() {
  const candidates = [
    resolve(cwd, 'compile/cmp.mjs'),
    resolve(cwd, 'compile', 'cmp.mjs'),
    resolve(cliDir, 'compile', 'cmp.mjs'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error('Compiler not found. Expected compile/cmp.mjs');
}

async function compileShortFile(filePath, outDir, root) {
  const compiler = findCompiler();
  const targetDir = outDir || dirname(filePath);
  mkdirSync(targetDir, { recursive: true });

  const resolvedFile = resolve(root, filePath);
  execFileSync(process.execPath, [compiler, resolvedFile, '--root', root, '--out', targetDir], {
    cwd,
    stdio: 'inherit',
  });

  const fileName = basename(resolvedFile, extname(resolvedFile));
  const compiledPath = join(targetDir, `${fileName}.html`);
  if (!existsSync(compiledPath)) {
    throw new Error(`Compilation did not produce ${compiledPath}`);
  }

  return compiledPath;
}

async function compileDirectory(dirPath, outDir, root) {
  const compiler = findCompiler();
  const sourceDir = resolve(root, dirPath);
  const targetDir = outDir || sourceDir;
  mkdirSync(targetDir, { recursive: true });

  const files = [];
  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (extname(entry.name).toLowerCase() === '.st') {
        files.push(full);
      }
    }
  }

  walk(sourceDir);

  for (const file of files) {
    const parsed = basename(file, extname(file));
    const rel = file.slice(sourceDir.length).replace(/^[\\/]+/, '');
    const destDir = rel ? join(targetDir, dirname(rel)) : targetDir;
    mkdirSync(destDir, { recursive: true });
    execFileSync(process.execPath, [compiler, file, '--root', sourceDir, '--out', destDir], { cwd, stdio: 'inherit' });
    const compiled = join(destDir, `${parsed}.html`);
    if (!existsSync(compiled)) {
      throw new Error(`Compilation did not produce ${compiled}`);
    }
  }

  copyAssets(sourceDir, targetDir);
  return targetDir;
}

function copyAssets(root, outDir) {
  const assetExtensions = new Set(['.html', '.css', '.js']);
  const outputRoot = resolve(outDir);

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const sourcePath = join(currentDir, entry.name);
      if (entry.name === 'node_modules' || entry.name.startsWith('.') ||
          sourcePath === outputRoot || sourcePath.startsWith(`${outputRoot}${sep}`)) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(sourcePath);
      } else if (assetExtensions.has(extname(entry.name).toLowerCase())) {
        const destinationPath = join(outputRoot, relative(root, sourcePath));
        mkdirSync(dirname(destinationPath), { recursive: true });
        copyFileSync(sourcePath, destinationPath);
      }
    }
  }

  walk(root);
}

function startDevelopment(root, outDir, port) {
  const compiler = findCompiler();
  mkdirSync(outDir, { recursive: true });
  copyAssets(root, outDir);
  const compilerProcess = spawn(process.execPath, [
    compiler,
    '--root',
    root,
    '--out',
    outDir,
    '--watch',
  ], { cwd, stdio: 'inherit' });

  const stop = () => {
    compilerProcess.kill();
    process.exit(0);
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  compilerProcess.once('exit', (code) => {
    if (code !== 0) process.exitCode = code || 1;
  });

  let assetTimer;
  watchFiles(root, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    const changedPath = String(filename);
    const changedAbsolutePath = resolve(root, changedPath);
    if (changedAbsolutePath === resolve(outDir) ||
        changedAbsolutePath.startsWith(`${resolve(outDir)}${sep}`)) {
      return;
    }
    const extension = extname(changedPath).toLowerCase();
    if (!['.html', '.css', '.js'].includes(extension)) return;

    clearTimeout(assetTimer);
    assetTimer = setTimeout(() => copyAssets(root, outDir), 100);
  });

  serveDirectory(outDir, port);
}

function serveDirectory(rootDir, port) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
  };

  const server = http.createServer(async (req, res) => {
    const urlPath = new URL(req.url || '/', 'http://localhost');
    let requested = decodeURIComponent(urlPath.pathname);
    if (requested === '/') requested = '/index.html';

    const target = resolve(rootDir, `.${requested}`);
    if (!target.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    try {
      const data = await readFile(target);
      const ext = extname(target).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    console.log(`short server running at http://localhost:${port}`);
    console.log(`Serving ${rootDir}`);
  });
}

try {
  const options = parseArgs(args);
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.dev) {
    startDevelopment(options.root, options.out || resolve(cwd, '.short'), options.port);
    await new Promise(() => {});
  }

  const targetPath = resolve(options.root, options.target);

  if (options.serve && isDir(targetPath)) {
    serveDirectory(targetPath, options.port);
    await new Promise(() => {});
  }

  else if (options.serve && existsSync(targetPath) && extname(targetPath).toLowerCase() === '.short') {
    const compiled = await compileShortFile(targetPath, options.out || dirname(targetPath), options.root);
    serveDirectory(dirname(compiled), options.port);
    await new Promise(() => {});
  }

  else if (existsSync(targetPath) && extname(targetPath).toLowerCase() === '.short') {
    await compileShortFile(targetPath, options.out || dirname(targetPath), options.root);
    process.exit(0);
  }

  else if (isDir(targetPath)) {
    await compileDirectory(targetPath, options.out || targetPath, options.root);
    if (options.serve) {
      serveDirectory(options.out || targetPath, options.port);
      await new Promise(() => {});
    } else {
      process.exit(0);
    }
  }

  if (!existsSync(targetPath)) {
    throw new Error(`Target not found: ${options.target}`);
  }

  throw new Error(`Unsupported target: ${options.target}`);
} catch (error) {
  console.error(error.message);
  printHelp();
  process.exit(1);
}
