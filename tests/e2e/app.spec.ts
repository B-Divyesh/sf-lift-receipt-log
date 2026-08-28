import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
