import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));
const override = config.responseOverrides?.['404'];
if (override?.rewrite !== '/404.html' || override.statusCode !== 404) {
  throw new Error('Static Web Apps must rewrite a missing route to /404.html with HTTP 404.');
}

const page = await readFile(new URL('../public/404.html', import.meta.url), 'utf8');
for (const expected of ['<html lang="en">', '<main id="main"', '<h1>That page is not in your log.</h1>', '<title>Page not found — Set Receipt</title>', 'href="/"']) {
  if (!page.includes(expected)) throw new Error(`404 page is missing required markup: ${expected}`);
}

console.log('Static 404 configuration and recovery page verified.');
