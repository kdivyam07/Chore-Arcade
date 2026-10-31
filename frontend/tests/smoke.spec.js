import { test, expect } from '@playwright/test';
test('demo decision changes mock inbox and can be undone', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-character="rive-kid"]')).toHaveAttribute('data-loaded', 'true');
  await expect(page.locator('[data-character="rive-kid"] canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Say hello to Milo' }).click();
  await expect(page.locator('[data-character="rive-kid"]')).toHaveAttribute(
    'data-animation',
    'Run',
  );
  await page.getByRole('button', { name: 'Play the demo' }).click();
  await expect(page.getByText('GET READY, CAPTAIN')).toBeVisible();
  await expect(page.getByText('GET READY, CAPTAIN')).toBeHidden();
  await expect(page.getByText('DEMO · MOCK EMAILS')).toBeVisible();
  await expect(page.locator('[data-character="rive-kid"]')).toHaveAttribute('data-loaded', 'true');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'TAKE A BREATHER.' })).toBeVisible();
  await page.getByRole('button', { name: '▶ RESUME MISSION' }).click();
  await page.getByRole('button', { name: '▶ BOWL THIS EMAIL', exact: true }).click();
  await page.getByRole('button', { name: '🏏 SWING NOW', exact: true }).click();
  await expect(page.getByText('TOO EARLY!', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekend deals are here' })).toBeVisible();
  await page.getByLabel('Relaxed mode · no timing required').check();
  await page.getByRole('button', { name: '↻ RETRY DELIVERY', exact: true }).click();
  await page.getByRole('button', { name: '🏏 SWING NOW', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your interview confirmation' })).toBeVisible();
  await page.getByRole('button', { name: 'Review & apply decisions' }).click();
  await expect(page.getByText('DRY RUN · NO CHANGES APPLIED YET')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm & apply 1 decisions' }).click();
  await page.getByRole('button', { name: 'Finish mission' }).click();
  await expect(page.getByRole('heading', { name: 'A little less chaos.' })).toBeVisible();
  await page.getByRole('button', { name: 'Undo this mission' }).click();
  await expect(page.getByRole('heading', { name: 'Changes undone.' })).toBeVisible();
});
