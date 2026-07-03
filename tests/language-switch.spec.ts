import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await expect(page.locator('#infoButtonHeader')).toContainText('ℹ️ Einführung');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('#infoButtonHeader')).toContainText('ℹ️ Introduction');
  await page.getByText('▶️ Calendar').click();
  await expect(page.locator('app-calendar-panel')).toContainText('Easter date');
  await page.getByRole('button', { name: 'DE' }).click();
  await expect(page.locator('app-calendar-panel')).toContainText('Osterdatum');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('#infoButtonHeader')).toContainText('ℹ️ Introduction');
});
