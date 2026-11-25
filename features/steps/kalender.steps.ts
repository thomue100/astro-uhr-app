// features/steps/kalender.steps.ts – Kalender-Panel und Kalenderscheibe
import { expect } from '@playwright/test';
import { When, Then } from '../support/fixtures';

When('ich den Kalender öffne', async ({ uhr }) => {
  await uhr.oeffneKalender();
});

Then('zeigt der Kalender {string}', async ({ uhr }, text: string) => {
  await expect(uhr.kalenderPanel).toContainText(text);
});

Then(
  'zeigt der Zeiger der Kalenderscheibe auf denselben Tag wie im Referenzbild {string}',
  async ({ uhr, page }, bild: string) => {
    await expect(page).toHaveScreenshot(`${bild}.png`, {
      clip: await uhr.zeigerAusschnitt(),
      scale: 'device', // volle Auflösung: Ziffern der Tageszeilen bleiben lesbar
      maxDiffPixelRatio: 0.02,
    });
  },
);
