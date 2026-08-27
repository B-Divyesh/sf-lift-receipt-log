import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name)));
  return files.flat();
}

const root = new URL('../dist/', import.meta.url).pathname;
const diskFiles = (await walk(root)).sort();
const files = diskFiles
  .map((file) => `/${relative(root, file)}`)
  .filter((file) => !file.endsWith('/sw.js') && !file.endsWith('.map'));
const template = await readFile(new URL('../src/sw-template.js', import.meta.url), 'utf8');
const hash = createHash('sha256');
for (const file of diskFiles.filter((file) => !file.endsWith('/sw.js') && !file.endsWith('.map'))) hash.update(await readFile(file));
await writeFile(join(root, 'sw.js'), template.replace('__VERSION__', hash.digest('hex').slice(0, 10)).replace('__PRECACHE__', JSON.stringify(files)));
