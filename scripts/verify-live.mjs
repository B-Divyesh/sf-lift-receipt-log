import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = (process.argv[2] ?? 'https://lift-receipt-log.sociobot.in').replace(/\/$/, '');
const evidenceDir = process.argv[3] ?? 'test-results/evidence/live';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch();
const errors = [];
const externalRequests = [];
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  extraHTTPHeaders: { 'Cache-Control': 'no-cache' },
});
const page = await context.newPage();
let seriousAxeViolations = 0;
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', (request) => {
  if (new URL(request.url()).origin !== origin) externalRequests.push(request.url());
});

const belowFold = async (locator) => {
  const box = await locator.boundingBox();
  assert(box, 'Expected element to have a layout box');
  return box.y + box.height > 844;
};

try {
  let response = await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200);
  assert.equal(await page.title(), 'Set Receipt — log lifts and keep receipts');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await belowFold(page.getByRole('link', { name: 'Try it with sample data' })), false);
  assert.equal(await belowFold(page.getByText('Loads a separate sample log.')), false);
  assert.equal(await belowFold(page.getByRole('button', { name: /Log set/ })), false);
  await page.screenshot({ path: `${evidenceDir}/cold-mobile-root.png` });

  await page.getByLabel('Exercise').fill('sq');
  await page.getByLabel('Weight × reps').fill('225x5');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  assert.equal(page.url(), `${origin}/?demo=1`);
  await page.getByText('Demo — sample data, nothing is saved to your log').waitFor();
  assert.equal(await page.locator('.set-row').count(), 3);
  assert.equal(await belowFold(page.locator('.set-row').first()), false);
  await page.screenshot({ path: `${evidenceDir}/cold-mobile-demo.png` });

  await page.getByRole('button', { name: 'Remove Bench press set' }).first().click();
  await page.waitForFunction(() => document.querySelectorAll('.set-row').length === 2);
  assert.equal(await page.locator('.set-row').count(), 2);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.set-row').length === 3);
  assert.equal(await page.locator('.set-row').count(), 3);
  await page.getByRole('button', { name: 'Remove Bench press set' }).first().click();
  await page.waitForFunction(() => document.querySelectorAll('.set-row').length === 2);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL(`${origin}/`);
  assert.equal(await page.locator('.set-row').count(), 1);
  assert.equal(await page.locator('.set-exercise').first().textContent(), 'Squat');
  await page.goto(`${origin}/?demo=1`);
  await page.waitForFunction(() => document.querySelectorAll('.set-row').length === 3);
  assert.equal(await page.locator('.set-row').count(), 3);

  const routes = [
    ['/', 'Set Receipt — log lifts and keep receipts'],
    ['/?demo=1', 'Demo — Set Receipt'],
    ['/?view=history', 'Receipts — Set Receipt'],
    ['/?view=settings', 'Setup — Set Receipt'],
    ['/privacy', 'Privacy — Set Receipt'],
    ['/terms', 'Terms — Set Receipt'],
  ];
  const renderedCopy = [];
  for (const [path, title] of routes) {
    response = await page.goto(`${origin}${path}`);
    assert.equal(response?.status(), 200, path);
    await page.waitForFunction((expected) => document.title === expected, title);
    assert.equal(await page.title(), title, path);
    assert.equal(await page.locator('h1').count(), 1, path);
    assert.equal(await page.locator('main').count(), 1, path);
    assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /\S+/, path);
    assert.match(await page.locator('meta[property="og:image"]').getAttribute('content'), /set-receipt-social\.webp$/, path);
    assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image', path);
    assert.equal(await page.locator('footer').getByRole('link', { name: 'Privacy' }).getAttribute('href'), '/privacy', path);
    assert.equal(await page.locator('footer').getByRole('link', { name: 'Terms' }).getAttribute('href'), '/terms', path);
    const axe = await new AxeBuilder({ page }).analyze();
    seriousAxeViolations += axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).length;
    renderedCopy.push(await page.locator('body').innerText());
  }

  await page.goto(`${origin}/`);
  await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Privacy');
  await page.goBack();
  assert.match(await page.evaluate(() => document.activeElement?.textContent ?? ''), /Log sets/);

  assert.deepEqual(errors, []);
  response = await page.goto(`${origin}/definitely-missing`);
  assert.equal(response?.status(), 404);
  assert.equal(await page.title(), 'Page not found — Set Receipt');
  assert.equal(await page.getByRole('link', { name: 'Open the logger' }).getAttribute('href'), '/');
  assert.equal(await page.getByRole('link', { name: 'Try sample data' }).getAttribute('href'), '/?demo=1');
  const axe404 = await new AxeBuilder({ page }).analyze();
  seriousAxeViolations += axe404.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).length;

  const copy = renderedCopy.join('\n');
  assert.doesNotMatch(copy, /IMMUTABLE TRAINING RECORD|OPEN RECEIPT|ONE-TIME UNLOCK|LOCAL LIFT LOG|THE PLAIN-LANGUAGE VERSION|SHORT AND STRAIGHT|YOUR TRAINING, YOUR FILE|MAKE THE SHORTHAND YOURS/);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(errors.filter((message) => !message.includes('status of 404')), []);
  assert.equal(seriousAxeViolations, 0);
} finally {
  await context.close();
}

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
try {
  await offlinePage.goto(`${origin}/?demo=1`);
  await offlinePage.evaluate(async () => { await navigator.serviceWorker.ready; });
  await offlinePage.reload();
  await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await offlineContext.setOffline(true);
  await offlinePage.reload();
  await offlinePage.getByText('Offline · logging still works').waitFor();
  assert.equal(await offlinePage.locator('.set-row').count(), 3);
  await offlinePage.getByLabel('Exercise').fill('Deadlift');
  await offlinePage.getByLabel('Weight × reps').fill('325x3');
  await offlinePage.getByLabel('Weight × reps').press('Enter');
  await offlinePage.getByText('325lb × 3', { exact: true }).waitFor();
  await offlinePage.screenshot({ path: `${evidenceDir}/cold-mobile-offline.png` });
} finally {
  await offlineContext.close();
  await browser.close();
}

console.log(JSON.stringify({ origin, routes: 6, demoIsolation: 'pass', offline: 'pass', externalRequests: 0, consoleErrors: 0, seriousAxeViolations }));
