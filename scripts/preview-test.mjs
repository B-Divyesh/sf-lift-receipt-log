import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4173);
const contentTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8',
};

function fileFor(pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = normalize(join(root, requested));
  return file.startsWith(root) ? file : join(root, 'index.html');
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
  const file = fileFor(url.pathname);
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    const type = contentTypes[extname(file)] ?? 'application/octet-stream';
    response.setHeader('Content-Type', type);
    response.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/sw.js' && request.headers.cookie?.includes('set-receipt-test-update=1')) {
      const source = await readFile(file, 'utf8');
      response.end(`${source}\n// changed worker served only to the update regression test\n`);
      return;
    }
    createReadStream(file).pipe(response);
  } catch {
    // The static deployment rewrites app routes to the shell too.
    createReadStream(join(root, 'index.html')).pipe(response);
  }
}).listen(port, '127.0.0.1');
