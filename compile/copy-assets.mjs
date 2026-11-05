import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const assetExtensions = new Set(['.js', '.css', '.html']);

const args = process.argv.slice(2);
let outputRoot = '.short';
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--out' || args[i] === '-o') && args[i + 1] && !args[i + 1].startsWith('-')) {
    outputRoot = resolve(projectRoot, args[i + 1]);
    args.splice(i, 2); // remove so they don't get treated as positional
    i--;
  }
}

async function collectAssets(directory, assets = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const sourcePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collectAssets(sourcePath, assets);
    } else if (assetExtensions.has(extname(entry.name).toLowerCase())) {
      assets.push(sourcePath);
    }
  }
  return assets;
}

async function copyAsset(sourcePath) {
  const relativePath = relative(projectRoot, sourcePath);
  const destinationPath = resolve(outputRoot, relativePath);

  // Special handling: if source is short.js, place it in app/ directory
  if (basename(sourcePath) === 'short.js' && !relativePath.startsWith('app/')) {
    const destinationPath = resolve(outputRoot, 'app', 'short.js');
    await mkdir(dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    return;
  }

  await mkdir(dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
}

const requestedPaths = process.argv.slice(2).filter(Boolean);
const sourcePaths = requestedPaths.length > 0
  ? requestedPaths.map((filePath) => resolve(projectRoot, filePath))
  : [resolve(projectRoot, 'short.js'), ...await collectAssets(resolve(projectRoot, 'app'))];

for (const sourcePath of sourcePaths) {
  try {
    await copyAsset(sourcePath);
  } catch (error) {
    if (error.code !== 'ENOENT' || requestedPaths.length === 0) throw error;
  }
}
