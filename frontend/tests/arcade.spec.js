import { test, expect } from '@playwright/test';
for (const game of [
  { id: 'blaster', name: 'Orbit Blaster', button: '🚀 FIRE LASER' },
  { id: 'hoops', name: 'Hoop Hustle', button: '🏀 GUIDED SHOT' },
]) {
  test(`${game.name} queues two deliberate actions, applies them, and undoes them`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: `Select ${game.name}`, exact: true }).click();
    await expect(
      page.getByRole('button', { name: `Select ${game.name}`, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Play the demo', exact: true }).click();
    await expect(page.getByText('GET READY, CAPTAIN')).toBeVisible();
    await expect(page.getByText('GET READY, CAPTAIN')).toBeHidden();
    if (game.id === 'blaster') {
      await page.locator('svg.interactive-arena').scrollIntoViewIfNeeded();
      const target = await page.getByTestId('email-asteroid').boundingBox();
      await page.mouse.click(target.x + target.width / 2, target.y + target.height / 2);
    } else {
      const court = page.locator('svg.interactive-arena');
      await court.scrollIntoViewIfNeeded();
      const rect = await court.boundingBox();
      await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.84);
      await page.mouse.down();
      await page.mouse.move(rect.x + rect.width * (510 / 900), rect.y + rect.height * (590 / 500), {
        steps: 10,
      });
      await page.mouse.up();
    }
    await expect(
      page.getByRole('heading', { name: 'Your interview confirmation', exact: true }),
    ).toBeVisible();
    if (game.id === 'blaster') await page.getByLabel('Relaxed mode · auto aim').check();
    await page.getByRole('button', { name: /3 Keep/ }).click();
    await page.getByRole('button', { name: game.button, exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'The weekly design digest', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Review & apply decisions', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm & apply 2 decisions', exact: true }).click();
    await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'A little less chaos.', exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('.report .stats > div').filter({ hasText: 'CHANGED' }).locator('strong'),
    ).toHaveText('1');
    await page.getByRole('button', { name: 'Undo this mission', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Changes undone.', exact: true })).toBeVisible();
  });
}
