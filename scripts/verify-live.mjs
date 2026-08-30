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
});
const page = await context.newPage();
if (new URL(origin).hostname === '127.0.0.1' || new URL(origin).hostname === 'localhost') {
  await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: '{"data":[]}',
  }));
}
let seriousAxeViolations = 0;
let demoExternalRequests = [];
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
  demoExternalRequests = [...externalRequests];

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
    if (path === '/?view=settings') {
      await page.locator('a:has-text("Buy Pro"), button:has-text("Checkout unavailable")').first().waitFor();
    }
    if (path === '/terms') {
      assert.match(await page.locator('main').innerText(), /Sociobot\/Dodo is the merchant of record/);
      assert.match(await page.locator('main').innerText(), /Refunds are handled there and automatically revoke the Pro license/);
    }
    const axe = await new AxeBuilder({ page }).analyze();
    seriousAxeViolations += axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).length;
    renderedCopy.push(await page.locator('body').innerText());
  }

  await page.goto(`${origin}/`);
  await page.getByRole('heading', { name: 'Log sets. Keep a workout receipt.' }).waitFor();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Skip to workout');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'main');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
  assert.match(page.url(), /#main$/);

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
  assert.deepEqual(demoExternalRequests, []);
  assert.deepEqual(externalRequests.filter((url) => !url.startsWith('https://api.sociobot.in/api/v1/products')), []);
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
}

const tabsContext = await browser.newContext();
try {
  const firstTab = await tabsContext.newPage();
  const secondTab = await tabsContext.newPage();
  await Promise.all([firstTab.goto(`${origin}/`), secondTab.goto(`${origin}/`)]);
  await firstTab.getByLabel('Exercise').fill('Squat');
  await firstTab.getByLabel('Weight × reps').fill('225x5');
  await firstTab.getByLabel('Weight × reps').press('Enter');
  await secondTab.getByLabel('Exercise').fill('Bench press');
  await secondTab.getByLabel('Weight × reps').fill('185x5');
  await secondTab.getByLabel('Weight × reps').press('Enter');
  await firstTab.reload();
  assert.equal(await firstTab.locator('.set-row').count(), 2);
} finally {
  await tabsContext.close();
}

const volumeContext = await browser.newContext();
try {
  const volumePage = await volumeContext.newPage();
  await volumePage.goto(`${origin}/`);
  await volumePage.getByLabel('Exercise').fill('Squat');
  for (const expression of ['2000x999', '100x8kg', '135 × 10']) {
    await volumePage.getByLabel('Weight × reps').fill(expression);
    await volumePage.getByLabel('Weight × reps').press('Enter');
  }
  await volumePage.getByRole('button', { name: 'Finish workout' }).click();
  assert.match(await volumePage.locator('.totals').innerText(), /Volume by unit\s+1,999,350 lb·reps \+ 800 kg·reps/i);
  assert.doesNotMatch(await volumePage.locator('.totals').innerText(), /2,000,150/);
} finally {
  await volumeContext.close();
}

const timerContext = await browser.newContext();
try {
  const timerPage = await timerContext.newPage();
  await timerPage.goto(`${origin}/`);
  await timerPage.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('set-receipt', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite');
      tx.objectStore('documents').put({ version: 1, workouts: [], aliases: [], settings: { unit: 'lb', restSeconds: 1, theme: 'auto' } }, 'app-data');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await timerPage.reload();
  await timerPage.getByLabel('Exercise').fill('Squat');
  await timerPage.getByLabel('Weight × reps').fill('225x5');
  await timerPage.getByLabel('Weight × reps').press('Enter');
  await timerPage.locator('#rest-time').getByText('DONE', { exact: true }).waitFor({ timeout: 3_000 });
  await timerPage.waitForTimeout(500);
  assert.equal(await timerPage.locator('#rest-time').textContent(), 'DONE');
  assert.equal(await timerPage.getByRole('button', { name: 'Start rest timer' }).count(), 1);
  assert.equal(await timerPage.locator('.toast').textContent(), 'Rest complete. Ready for the next set.');
} finally {
  await timerContext.close();
}

const licenseContext = await browser.newContext();
try {
  const licensePage = await licenseContext.newPage();
  await licensePage.goto(`${origin}/`);
  await licensePage.evaluate(async () => { await navigator.serviceWorker.ready; });
  await licensePage.reload();
  await licensePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await licenseContext.setOffline(true);
  await licensePage.goto(`${origin}/?license=live-never-verified-token`);
  await licensePage.getByRole('button', { name: 'Setup' }).click();
  assert.equal(await licensePage.getByText('Pro is active in this browser.').count(), 0);
  assert.equal(await licensePage.locator('#custom-rest').count(), 0);
  assert.equal(await licensePage.evaluate(() => localStorage.getItem('sb_license:lift-receipt-log:verdict')), null);
} finally {
  await licenseContext.close();
  await browser.close();
}

console.log(JSON.stringify({ origin, routes: 6, demoIsolation: 'pass', offline: 'pass', skipFocus: 'pass', concurrentTabs: 'pass', unitAwareVolume: 'pass', timerCompletion: 'pass', unverifiedOfflineLicense: 'pass', purchaseTerms: 'pass', demoExternalRequests: demoExternalRequests.length, allowedCheckoutChecks: externalRequests.length, consoleErrors: 0, seriousAxeViolations }));
