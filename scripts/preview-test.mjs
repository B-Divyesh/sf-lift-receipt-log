import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4173);
const appRoutes = new Set(['/', '/demo', '/privacy', '/terms']);
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

function sendFile(response, file, status = 200) {
  const type = contentTypes[extname(file)] ?? 'application/octet-stream';
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(response);
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
  // Match Azure Static Web Apps: this file configures the host but is not a
  // public asset. Keeping the test server honest catches failed SW installs.
  if (url.pathname === '/staticwebapp.config.json') {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('Not found');
    return;
  }
  const file = fileFor(url.pathname);
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    if (url.pathname === '/sw.js' && request.headers.cookie?.includes('set-receipt-test-update=1')) {
      response.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      const source = await readFile(file, 'utf8');
      response.end(`${source}\n// changed worker served only to the update regression test\n`);
      return;
    }
    sendFile(response, file);
  } catch {
    if (appRoutes.has(url.pathname)) {
      // The static deployment rewrites its known application routes to the shell.
      sendFile(response, join(root, 'index.html'));
      return;
    }
    // Keep local browser tests aligned with the production 404 override.
    sendFile(response, join(root, '404.html'), 404);
  }
}).listen(port, '127.0.0.1');
