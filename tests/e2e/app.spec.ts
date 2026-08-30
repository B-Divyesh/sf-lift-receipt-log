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

test('logs a set by keyboard and files an immutable receipt', async ({ page }) => {
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

test('shows helpful validation and aliases remain editable', async ({ page }) => {
  await page.getByLabel('Exercise').fill('Bench press');
  await page.getByLabel('Weight × reps').fill('225');
  await page.getByRole('button', { name: /Log set/ }).click();
  await expect(page.locator('#entry-error')).toHaveText('Use weight x reps, like 225x5.');

  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByLabel('Short code').fill('rdl');
  await page.getByLabel('Exercise', { exact: true }).fill('Romanian deadlift');
  await page.getByRole('button', { name: 'Add alias' }).click();
  await expect(page.getByText('→ Romanian deadlift')).toBeVisible();
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

test('erase all local data resets workouts, aliases, and settings after reload', async ({ page }) => {
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

test('successful recovery actions replace stale import and alias errors', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }));
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

  await page.getByRole('button', { name: 'Log' }).click();
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.locator('.toast')).toHaveText('Workout finished. Receipt filed.');
  await page.getByRole('button', { name: 'Share receipt' }).click();
  await expect(page.locator('.toast')).toHaveText('Receipt copied.');

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

test('has no serious accessibility violations on core and legal screens', async ({ page }) => {
  for (const path of ['/', '/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
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

test('installs despite the production-unavailable host config, then reloads and logs offline', async ({ page, context }) => {
  await page.goto('/');
  await expect.poll(() => page.evaluate(async () => (await fetch('/staticwebapp.config.json')).status)).toBe(404);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Offline · logging still works')).toBeVisible();
  await page.getByLabel('Exercise').fill('Deadlift');
  await page.getByLabel('Weight × reps').fill('315x3');
  await page.getByLabel('Weight × reps').press('Enter');
  await expect(page.locator('.set-list').getByText('315lb × 3', { exact: true })).toBeVisible();
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
