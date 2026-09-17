#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import http from 'node:http';

const args = process.argv.slice(2);
const cwd = process.cwd();

function printHelp() {
  console.log(`short.js CLI

Usage:
  short <path-to-.short-or-dir> [--out <dir>] [--port <port>] [--serve]
  node ./cli.mjs <path-to-.short-or-dir> [--out <dir>] [--port <port>] [--serve]

Examples:
  short ./site.short
  short ./.short --serve --port 3000
  short ./example.short --out ./dist
`);
}

function parseArgs(inputArgs) {
  const opts = {
    serve: false,
    port: Number(process.env.PORT || 3000),
    out: null,
  };
  const positional = [];

  for (let i = 0; i < inputArgs.length; i += 1) {
    const arg = inputArgs[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--serve' || arg === '-s') {
      opts.serve = true;
    } else if (arg === '--out' || arg === '-o') {
      if (i + 1 >= inputArgs.length) throw new Error('Missing value for --out');
      opts.out = resolve(cwd, inputArgs[++i]);
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

  return { ...opts, target: positional[0] || '.short' };
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
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error('Compiler not found. Expected compile/cmp.mjs');
}

async function compileShortFile(filePath, outDir) {
  const compiler = findCompiler();
  const targetDir = outDir || dirname(filePath);
  mkdirSync(targetDir, { recursive: true });

  const resolvedFile = resolve(cwd, filePath);
  execFileSync(process.execPath, [compiler, resolvedFile, '--out', targetDir], {
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

async function compileDirectory(dirPath, outDir) {
  const compiler = findCompiler();
  const root = resolve(cwd, dirPath);
  const targetDir = outDir || root;
  mkdirSync(targetDir, { recursive: true });

  const files = [];
  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (extname(entry.name).toLowerCase() === '.short') {
        files.push(full);
      }
    }
  }

  walk(root);

  for (const file of files) {
    const parsed = basename(file, extname(file));
    const rel = file.slice(root.length).replace(/^[\\/]+/, '');
    const destDir = rel ? join(targetDir, dirname(rel)) : targetDir;
    mkdirSync(destDir, { recursive: true });
    execFileSync(process.execPath, [compiler, file, '--out', destDir], { cwd, stdio: 'inherit' });
    const compiled = join(destDir, `${parsed}.html`);
    if (!existsSync(compiled)) {
      throw new Error(`Compilation did not produce ${compiled}`);
    }
  }

  return targetDir;
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
    console.log(`short.js server running at http://localhost:${port}`);
    console.log(`Serving ${rootDir}`);
  });
}

try {
  const options = parseArgs(args);
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const targetPath = resolve(cwd, options.target);

  if (options.serve && isDir(targetPath)) {
    serveDirectory(targetPath, options.port);
    process.exit(0);
  }

  if (options.serve && existsSync(targetPath) && extname(targetPath).toLowerCase() === '.short') {
    const compiled = await compileShortFile(targetPath, options.out || dirname(targetPath));
    serveDirectory(dirname(compiled), options.port);
    process.exit(0);
  }

  if (existsSync(targetPath) && extname(targetPath).toLowerCase() === '.short') {
    await compileShortFile(targetPath, options.out || dirname(targetPath));
    process.exit(0);
  }

  if (isDir(targetPath)) {
    await compileDirectory(targetPath, options.out || targetPath);
    if (options.serve) serveDirectory(options.out || targetPath, options.port);
    process.exit(0);
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
