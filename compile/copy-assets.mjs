import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputRoot = resolve('/tmp/short');
const assetExtensions = new Set(['.js', '.css', '.html']);

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
