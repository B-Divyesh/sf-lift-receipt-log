import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectMinimumTouchTargets(page: Page, state: string): Promise<void> {
  const failures = await page.locator('a, button, select, textarea, input:not([type="radio"]):not([type="file"]), summary, label.file-button').evaluateAll((elements) => elements.flatMap((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return [];
    if (rect.width >= 44 && rect.height >= 44) return [];
    const label = element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name') || element.tagName;
    return [`${label}: ${rect.width.toFixed(3)} × ${rect.height.toFixed(3)}`];
  }));
  expect(failures, `${state} must keep every visible target at least 44 × 44 CSS px`).toEqual([]);
}

async function expectPrimaryNavigationSpacing(page: Page, state: string): Promise<void> {
  const gaps = await page.locator('.site-header nav .nav-button').evaluateAll((buttons) => buttons.slice(1).map((button, index) => {
    const previous = buttons[index].getBoundingClientRect();
    return button.getBoundingClientRect().left - previous.right;
  }));
  expect(gaps.length, `${state} must expose all primary navigation gaps`).toBe(2);
  for (const gap of gaps) expect(gap, `${state} primary navigation gap`).toBeGreaterThanOrEqual(8);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => indexedDB.deleteDatabase('set-receipt'));
  await page.reload();
});

test('@claim:keyboard-receipt logs a set by keyboard and files an immutable receipt', async ({ page }) => {
  await page.getByLabel('Exercise').fill('sq');
  await page.getByLabel('Weight × reps').fill('225x5');
  await page.getByLabel('Weight × reps').press('Enter');

  await expect(page.locator('.set-exercise').getByText('Squat', { exact: true })).toBeVisible();
  await expect(page.locator('.set-list').getByText('225lb × 5', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Personal record').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();

  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Workout receipt' })).toBeVisible();
  await expect(page.locator('.totals div').first().getByText('1', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Log the set. Keep the proof.' })).toBeVisible();
  await page.getByRole('button', { name: 'Receipts' }).click();
  await expect(page.getByRole('button', { name: /1 sets/ })).toBeVisible();
});

test('keeps the active exercise for consecutive keyboard entries', async ({ page }) => {
  const exercise = page.getByLabel('Exercise');
  const setExpression = page.getByLabel('Weight × reps');

  await exercise.fill('sq');
  await setExpression.fill('225x5');
  await setExpression.press('Enter');

  await expect(exercise).toHaveValue('Squat');
  await expect(setExpression).toBeFocused();

  await setExpression.fill('225x5');
  await setExpression.press('Enter');

  await expect(page.locator('.set-row')).toHaveCount(2);
  await expect(page.locator('#entry-error')).toBeEmpty();
  await expect(setExpression).toBeFocused();
});

test('@claim:editable-aliases shows helpful validation and aliases remain editable', async ({ page }) => {
  await page.getByLabel('Exercise').fill('Bench press');
  await page.getByLabel('Weight × reps').fill('225');
  await page.getByRole('button', { name: /Log set/ }).click();
  await expect(page.locator('#entry-error')).toHaveText('Use weight x reps, like 225x5.');

  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByLabel('Short code').fill('rdl');
  await page.getByLabel('Exercise', { exact: true }).fill('Romanian deadlift');
  await page.getByRole('button', { name: 'Add alias' }).click();
  await expect(page.getByText('→ Romanian deadlift')).toBeVisible();
  await page.getByRole('button', { name: 'Log' }).click();
  await page.getByLabel('Exercise').fill('rdl');
  await page.getByLabel('Weight × reps').fill('185x6');
  await page.getByLabel('Weight × reps').press('Enter');
  await expect(page.locator('.set-exercise').getByText('Romanian deadlift', { exact: true })).toBeVisible();
});

test('keeps the exercise while correcting an invalid set expression', async ({ page }) => {
  const exercise = page.getByLabel('Exercise');
  const setExpression = page.getByLabel('Weight × reps');

  await exercise.fill('sq');
  await setExpression.fill('2000.01x5');
  await setExpression.press('Enter');

  await expect(page.locator('#entry-error')).toHaveText('Weight must be between 0 and 2,000.');
  await expect(exercise).toHaveValue('Squat');
  await expect(setExpression).toBeFocused();

  await setExpression.fill('225x5');
  await setExpression.press('Enter');
  await expect(page.locator('.set-row')).toHaveCount(1);
  await expect(page.locator('#entry-error')).toBeEmpty();
});

test('explains how to recover from an invalid JSON import', async ({ page }) => {
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.locator('#import-file').setInputFiles('tests/fixtures/not-a-backup.json');
  await expect(page.locator('.toast')).toContainText('That file is not valid JSON. Choose a Set Receipt backup exported by this app and try again.');
});

test('@claim:erase-local-data resets workouts, aliases, and settings after reload', async ({ page }) => {
  await page.getByLabel('Exercise').fill('sq');
  await page.getByLabel('Weight × reps').fill('225x5');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByLabel('Kilograms (kg)').check();
  await page.locator('#rest-select').selectOption('180');
  await page.getByLabel('Short code').fill('rdl');
  await page.getByLabel('Exercise', { exact: true }).fill('Romanian deadlift');
  await page.getByRole('button', { name: 'Add alias' }).click();

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('1 workout(s), all aliases, and settings');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Erase all local data' }).click();
  await expect(page.locator('.toast')).toHaveText('All local workout data erased.');

  await page.reload();
  await page.getByRole('button', { name: 'Setup' }).click();
  await expect(page.getByLabel('Pounds (lb)')).toBeChecked();
  await expect(page.getByLabel('Kilograms (kg)')).not.toBeChecked();
  await expect(page.locator('#rest-select')).toHaveValue('120');
  await expect(page.locator('.alias-list code')).toHaveText(['sq', 'bp', 'dl', 'ohp']);
  await expect(page.getByText('→ Romanian deadlift')).toHaveCount(0);
  await page.getByRole('button', { name: 'Receipts' }).click();
  await expect(page.getByText('Finish a workout to file it here.')).toBeVisible();
});

test('@claim:data-portability @claim:receipt-share successful recovery actions replace stale import and alias errors', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }));
  await page.evaluate(() => {
    const createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (value: Blob | MediaSource) => {
      if (value instanceof Blob) void value.text().then((text) => sessionStorage.setItem('last-download', text));
      return createObjectURL(value);
    };
  });
  await page.getByLabel('Exercise').fill('sq');
  await page.getByLabel('Weight × reps').fill('225x5');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('button', { name: 'Setup' }).click();

  const malformed = 'tests/fixtures/not-a-backup.json';
  await page.locator('#import-file').setInputFiles(malformed);
  await expect(page.locator('.toast')).toHaveText('That file is not valid JSON. Choose a Set Receipt backup exported by this app and try again.');

  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await jsonDownload;
  await expect(page.locator('.toast')).toHaveText('JSON backup exported.');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('last-download'))).toContain('"workouts"');
  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  await csvDownload;
  await expect(page.locator('.toast')).toHaveText('CSV exported.');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('last-download'))).toContain('workout_id,started_at,ended_at,exercise,weight,unit,reps,is_pr');

  await page.getByRole('button', { name: 'Log' }).click();
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.locator('.toast')).toHaveText('Workout finished. Receipt filed.');
  await page.getByRole('button', { name: 'Share receipt' }).click();
  await expect(page.locator('.toast')).toHaveText('Receipt copied.');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('Squat: 225lb × 5');

  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByLabel('Short code').fill('sq');
  await page.getByLabel('Exercise', { exact: true }).fill('Back squat');
  await page.getByRole('button', { name: 'Add alias' }).click();
  await expect(page.locator('.toast')).toHaveText('That short code already exists.');
  await page.getByLabel('Short code').fill('rdl');
  await page.getByLabel('Exercise', { exact: true }).fill('Romanian deadlift');
  await page.getByRole('button', { name: 'Add alias' }).click();
  await expect(page.locator('.toast')).toHaveText('Alias added.');

  await page.locator('#import-file').setInputFiles(malformed);
  await expect(page.locator('.toast')).toContainText('not valid JSON');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#import-file').setInputFiles('tests/fixtures/valid-empty-backup.json');
  await expect(page.locator('.toast')).toHaveText('Backup imported.');
});

test('@claim:demo-sandbox sample data is one click away and isolated from the real log', async ({ page }) => {
  await page.getByLabel('Exercise').fill('sq');
  await page.getByLabel('Weight × reps').fill('225x5');
  await page.getByLabel('Weight × reps').press('Enter');

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your log')).toBeVisible();
  await expect(page.locator('.set-row')).toHaveCount(3);
  await expect(page.getByText('195lb × 5', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Remove Bench press set' }).first().click();
  await expect(page.locator('.set-row')).toHaveCount(2);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.set-row')).toHaveCount(3);
  await expect(page.locator('.toast')).toHaveText('Demo reset to sample data.');

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByText('Demo — sample data, nothing is saved to your log')).toHaveCount(0);
  await expect(page.locator('.set-row')).toHaveCount(1);
  await expect(page.locator('.set-exercise').getByText('Squat', { exact: true })).toBeVisible();
});

test('@claim:local-private ordinary demo logging sends requests only to this site', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByLabel('Exercise').fill('ohp');
  await page.getByLabel('Weight × reps').fill('95x5');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByLabel('Kilograms (kg)').check();
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.filter((url) => new URL(url).origin !== 'http://127.0.0.1:4173')).toEqual([]);
});

test('@claim:pro-price shows the one-time price and Sociobot checkout', async ({ page }) => {
  await page.getByRole('button', { name: 'Setup' }).click();
  await expect(page.locator('.price')).toHaveText('$9 once');
  await expect(page.getByRole('link', { name: 'Buy Pro' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/lift-receipt-log/checkout');
});

test('@claim:pro-features verifies once, enables custom rest, and persists private notes', async ({ page }) => {
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/lift-receipt-log/verify**', async (route) => {
    verificationRequests += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/?license=qa-license');
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'Setup' }).click();
  await expect(page.getByText('Pro is active on this device.')).toBeVisible();
  await page.locator('#custom-rest').fill('150');
  await page.getByRole('button', { name: 'Set', exact: true }).click();
  await expect(page.locator('.toast')).toHaveText('Custom rest saved.');

  await page.getByRole('button', { name: 'Log' }).click();
  await page.getByLabel('Exercise').fill('dl');
  await page.getByLabel('Weight × reps').fill('315x3');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await page.getByLabel('Private receipt note').fill('Grip felt solid.');
  await page.getByLabel('Private receipt note').press('Tab');
  await expect.poll(() => page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('set-receipt', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const value = await new Promise<{ workouts?: Array<{ note?: string }> } | undefined>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').get('app-data');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return value?.workouts?.[0]?.note;
  })).toBe('Grip felt solid.');

  await expect.poll(() => verificationRequests).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Setup' }).click();
  await expect(page.locator('#custom-rest')).toHaveValue('150');
  await expect.poll(() => verificationRequests).toBe(1);
  await expect(page.evaluate(() => localStorage.getItem('sb_license:lift-receipt-log'))).resolves.toBe('qa-license');
  await page.getByRole('button', { name: 'Remove license' }).click();
  await expect(page.locator('.toast')).toHaveText('License removed from this device.');
  await expect(page.evaluate(() => localStorage.getItem('sb_license:lift-receipt-log'))).resolves.toBeNull();
  await expect(page.getByRole('link', { name: 'Buy Pro' })).toBeVisible();
});

test('@claim:print-receipt exposes a print-ready completed receipt', async ({ page }) => {
  await page.getByLabel('Exercise').fill('bp');
  await page.getByLabel('Weight × reps').fill('185x5');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await page.evaluate(() => { window.print = () => sessionStorage.setItem('print-called', 'yes'); });
  await page.getByRole('button', { name: 'Print / save PDF' }).click();
  await expect(page.evaluate(() => sessionStorage.getItem('print-called'))).resolves.toBe('yes');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.receipt')).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.receipt-actions')).toBeHidden();
});

test('has no serious accessibility violations on core and legal screens', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const path of ['/', '/demo', '/privacy', '/terms']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), `${path} in ${colorScheme} mode`).toEqual([]);
    }
  }
});

test('keyboard-only flow uses the skip link and logs a set', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to workout' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Exercise')).toBeFocused();
  await page.keyboard.type('sq');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Weight × reps')).toBeFocused();
  await page.keyboard.type('225x5');
  await page.keyboard.press('Enter');
  await expect(page.locator('.set-list').getByText('225lb × 5', { exact: true })).toBeVisible();
});

test('keeps the visible PR stamp accessible in light and dark logged-workout states', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.evaluate(() => indexedDB.deleteDatabase('set-receipt'));
    await page.reload();
    await page.getByLabel('Exercise').fill('dl');
    await page.getByLabel('Weight × reps').fill('315x3');
    await page.getByLabel('Weight × reps').press('Enter');
    await expect(page.getByLabel('Personal record')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('@claim:offline-reload installs despite the unavailable host config, then reloads and logs offline', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/demo');
    await expect.poll(() => page.evaluate(async () => (await fetch('/staticwebapp.config.json')).status)).toBe(404);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText('Offline · logging still works')).toBeVisible();
    await page.getByLabel('Exercise').fill('Deadlift');
    await page.getByLabel('Weight × reps').fill('325x3');
    await page.getByLabel('Weight × reps').press('Enter');
    await expect(page.locator('.set-list').getByText('325lb × 3', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator('.set-list').getByText('325lb × 3', { exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});

test('offers an actionable notice for a waiting service-worker update', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await page.evaluate(() => { document.cookie = 'set-receipt-test-update=1; path=/'; });
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.waiting?.state ?? registration?.installing?.state ?? 'none';
  })).toBe('installed');

  const updateToast = page.locator('#update-toast');
  await expect(updateToast).toBeVisible();
  await expect(updateToast.getByRole('button', { name: 'Refresh' })).toBeVisible();
  const navigation = page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame());
  await updateToast.getByRole('button', { name: 'Refresh' }).click();
  await navigation;
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
});

test('mobile viewport has no horizontal page overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only layout assertion');
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: /Log set/ })).toBeVisible();
});

test('mobile targets and navigation spacing pass in every reported state', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only touch geometry regression');

  await expectMinimumTouchTargets(page, 'normal logger');
  await expectPrimaryNavigationSpacing(page, 'normal logger');

  await page.getByLabel('Exercise').fill('sq');
  await page.getByLabel('Weight × reps').fill('bad');
  await page.getByLabel('Weight × reps').press('Enter');
  await expect(page.locator('#entry-error')).toBeVisible();
  await expectMinimumTouchTargets(page, 'validation error');

  await page.getByLabel('Weight × reps').fill('225x5');
  await page.getByLabel('Weight × reps').press('Enter');
  await page.getByRole('button', { name: 'Remove Squat set' }).click();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
  await expectMinimumTouchTargets(page, 'undo notice');

  await page.getByRole('button', { name: 'Setup' }).click();
  await expectMinimumTouchTargets(page, 'settings');
  await expectPrimaryNavigationSpacing(page, 'settings');

  for (const path of ['/privacy', '/terms']) {
    await page.goto(path);
    await expectMinimumTouchTargets(page, path);
  }

  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.evaluate(() => { document.cookie = 'set-receipt-test-update=1; path=/'; });
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
  await expect(page.locator('#update-toast')).toBeVisible();
  await expectMinimumTouchTargets(page, 'service-worker update');
});
