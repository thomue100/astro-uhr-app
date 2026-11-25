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
