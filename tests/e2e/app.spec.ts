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

test('has no serious accessibility violations on core and legal screens', async ({ page }) => {
  for (const path of ['/', '/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('reloads and logs while offline after first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Offline · logging still works')).toBeVisible();
  await page.getByLabel('Exercise').fill('Deadlift');
  await page.getByLabel('Weight × reps').fill('315x3');
  await page.getByLabel('Weight × reps').press('Enter');
  await expect(page.locator('.set-list').getByText('315lb × 3', { exact: true })).toBeVisible();
});

test('mobile viewport has no horizontal page overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only layout assertion');
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: /Log set/ })).toBeVisible();
});
