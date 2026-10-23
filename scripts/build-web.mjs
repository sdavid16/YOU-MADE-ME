import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'dist');
const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js'
];
const requiredDirectories = [
  'assets',
  'src'
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function verifyInputs() {
  const missing = [];
  for (const file of requiredFiles) {
    if (!(await exists(resolve(root, file)))) missing.push(file);
  }
  for (const directory of requiredDirectories) {
    if (!(await exists(resolve(root, directory)))) missing.push(directory + '/');
  }
  if (missing.length) {
    throw new Error('Missing required web assets: ' + missing.join(', '));
  }
}

async function copyWebAssets() {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  for (const file of requiredFiles) {
    await cp(resolve(root, file), resolve(output, file));
  }
  for (const directory of requiredDirectories) {
    await cp(resolve(root, directory), resolve(output, directory), {
      recursive: true,
      force: true
    });
  }
}

await verifyInputs();
await copyWebAssets();
console.log('Web bundle ready at dist/.');
console.log('Included: index, manifest, service worker, assets and application source.');
