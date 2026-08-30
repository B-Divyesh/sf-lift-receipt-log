import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));
const override = config.responseOverrides?.['404'];
if (override?.rewrite !== '/404.html' || override.statusCode !== 404) {
  throw new Error('Static Web Apps must rewrite a missing route to /404.html with HTTP 404.');
}

const page = await readFile(new URL('../public/404.html', import.meta.url), 'utf8');
for (const expected of ['<html lang="en">', '<main id="main"', '<h1>That page is not in your log.</h1>', '<title>Page not found — Set Receipt</title>', 'href="/"', 'property="og:title"', 'property="og:image"', 'name="twitter:card"', 'name="twitter:image"']) {
  if (!page.includes(expected)) throw new Error(`404 page is missing required markup: ${expected}`);
}

for (const route of ['/demo', '/privacy', '/terms']) {
  const definition = config.routes?.find((item) => item.route === route);
  if (definition?.rewrite !== '/index.html' || 'statusCode' in definition) {
    throw new Error(`${route} must be a real SPA route without a forced status code.`);
  }
}

const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
for (const expected of ['<html lang="en">', '<title>Set Receipt — log lifts and keep receipts</title>', 'name="description"', 'rel="canonical"', 'property="og:image"', 'name="twitter:card"', 'rel="manifest"']) {
  if (!index.includes(expected)) throw new Error(`Index metadata is missing: ${expected}`);
}

const source = await readFile(new URL('../src/main.ts', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const publicCopy = `${source}\n${readme}\n${page}`;
for (const obsolete of ['IMMUTABLE TRAINING RECORD', 'OPEN RECEIPT', 'ONE-TIME UNLOCK', 'LOCAL LIFT LOG', 'THE PLAIN-LANGUAGE VERSION', 'SHORT AND STRAIGHT', 'YOUR TRAINING, YOUR FILE', 'MAKE THE SHORTHAND YOURS', 'compact receipt', 'on this device']) {
  if (publicCopy.includes(obsolete)) throw new Error(`Reviewed copy has regressed: ${obsolete}`);
}
if (!source.includes("const demoEntryPath = '/?demo=1'")) throw new Error('The one-click demo entry must use /?demo=1.');

const claims = JSON.parse(await readFile(new URL('../.factory/claims.json', import.meta.url), 'utf8'));
const tests = await readFile(new URL('../tests/e2e/app.spec.ts', import.meta.url), 'utf8');
for (const claim of claims) {
  const tag = `@claim:${claim.id}`;
  const occurrences = tests.split(tag).length - 1;
  if (occurrences !== 1) throw new Error(`${tag} must occur in exactly one test; found ${occurrences}.`);
  if (claim.test !== `npm run test:e2e -- --grep ${tag}`) throw new Error(`${claim.id} must list its exact tagged test command.`);
}

console.log(`Static routes, metadata, reviewed copy, and ${claims.length} claim registrations verified.`);
