// features/steps/ansicht.steps.ts – Umschalter über dem Rahmen und Farbhierarchie
import { expect } from '@playwright/test';
import { When, Then } from '../support/fixtures';

When('ich im Umschalter {string} wähle', async ({ uhr }, name: string) => {
  await uhr.ansichtKnopf(name).click();
});

When('ich im Umschalter {string} per Tastatur wähle', async ({ uhr }, name: string) => {
  await uhr.ansichtKnopf(name).focus();
  await uhr.page.keyboard.press('Enter');
});

Then('bietet das Menü keinen eigenen Punkt für das 3D-Modell', async ({ uhr }) => {
  await expect(uhr.page.locator('#controls').getByRole('button', { name: /3D/ })).toHaveCount(0);
});

Then('ist im Umschalter {string} gewählt', async ({ uhr }, name: string) => {
  await expect(uhr.ansichtKnopf(name)).toHaveAttribute('aria-pressed', 'true');
  // genau einer gewählt
  await expect(uhr.ansichtUmschalter.locator('button[aria-pressed="true"]')).toHaveCount(1);
});

Then('steht der Umschalter über dem Rahmen', async ({ uhr }) => {
  const umschalter = await uhr.box(uhr.ansichtUmschalter);
  const rahmen = await uhr.box(uhr.canvas);
  expect(umschalter.y + umschalter.height, 'Umschalter nicht über dem Rahmen').toBeLessThanOrEqual(rahmen.y);
});

Then('zeigt der Rahmen die Kalenderscheibe', async ({ uhr }) => {
  await expect.poll(async () => (await uhr.scheibenAnsicht()).sichtbar).toBe(true);
});

Then('zeigt der Rahmen das Zifferblatt', async ({ uhr }) => {
  await expect(uhr.canvas).toBeVisible();
  await expect.poll(async () => (await uhr.scheibenAnsicht()).sichtbar).toBe(false);
});

Then('ist das Kalender-Panel aufgeklappt', async ({ uhr }) => {
  await expect(uhr.page.locator('#calendarPanel > .controls-header')).toHaveAttribute('aria-expanded', 'true');
});

Then('sind im Menü nur Bedienbares und Überschriften gold', async ({ uhr }) => {
  const { beschriftungen, bedienbar } = await uhr.goldeneTexte();
  expect(beschriftungen, 'goldene Beschriftungen/Werte').toEqual([]);
  expect(bedienbar.length, 'keine goldenen Menüpunkte/Knöpfe gefunden').toBeGreaterThan(2);
});
