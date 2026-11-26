// features/steps/allgemein.steps.ts – Start, Datum, Sprache
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import { parseDatum } from '../support/astro-uhr';

Given('heute ist der {string}', async ({ uhr }, datum: string) => {
  await uhr.setzeHeute(parseDatum(datum));
});

Given('die Astro-Uhr ist geöffnet', async ({ uhr }) => {
  await uhr.oeffnen();
});

When('ich das Datum {string} einstelle', async ({ uhr }, datum: string) => {
  await uhr.stelleDatumEin(parseDatum(datum));
});

When('ich die Sprache umschalte', async ({ uhr }) => {
  await uhr.wechsleSprache();
});

Then('heißt der Menüpunkt für die Einführung {string}', async ({ uhr }, text: string) => {
  await expect(uhr.einfuehrung).toContainText(text);
});

Given('mein Browser ist auf die Sprache {string} eingestellt', async ({ uhr }, locale: string) => {
  await uhr.nutzeBrowserSprache(locale);
});

When('ich die Seite neu lade', async ({ uhr }) => {
  await uhr.neuLaden();
});

// ── Menü ────────────────────────────────────────────────────────────────
When('ich den Menüpunkt Simulation anklicke', async ({ uhr }) => {
  await uhr.page.locator('#simulationPanel > .controls-header').click();
});

Then('ist das Simulationsfeld zu sehen', async ({ uhr }) => {
  await expect(uhr.datumsfeld).toBeVisible();
});

Then('ist das Simulationsfeld zugeklappt', async ({ uhr }) => {
  // Panels klappen per max-height/opacity weich zu (0,4 s); das Feld darin
  // behält seine Größe und gilt für Playwright als „sichtbar“ → Panelhöhe prüfen.
  const inhalt = uhr.page.locator('#simulationPanel > .controls-content');
  await expect.poll(async () => (await inhalt.boundingBox())?.height ?? 0).toBeLessThan(1);
  await expect(inhalt).toHaveCSS('opacity', '0');
});
