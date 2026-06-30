/*
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByRole('textbox', { name: 'Datum und Uhrzeit:' }).fill('1965-05-22T12:00');
  await page.getByText('▶️ Kalender').click();
  await expect(page.locator('app-calendar-panel')).toContainText('Samstag');
  await expect(page.locator('app-calendar-panel')).toContainText('HELENA');
});
*/
import { test, expect } from '@playwright/test';

test('Kalenderansicht prüfen', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  await page.pause();

  await page
    .getByRole('textbox', { name: 'Datum und Uhrzeit:' })
    .fill('1965-05-22T12:00');

  await page.pause();

  await page.getByText('▶️ Kalender').click();

  await page.pause();

  await expect(
    page.locator('app-calendar-panel')
  ).toContainText('Samstag');

  await expect(
    page.locator('app-calendar-panel')
  ).toContainText('HELENA');
});
