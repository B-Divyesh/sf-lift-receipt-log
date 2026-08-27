import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name)));
  return files.flat();
}

const root = new URL('../dist/', import.meta.url).pathname;
const files = (await walk(root))
  .map((file) => `/${relative(root, file)}`)
  .filter((file) => !file.endsWith('/sw.js') && !file.endsWith('.map'));
const template = await readFile(new URL('../src/sw-template.js', import.meta.url), 'utf8');
await writeFile(join(root, 'sw.js'), template.replace('__PRECACHE__', JSON.stringify(files)));
