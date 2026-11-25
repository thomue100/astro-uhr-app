// features/steps/kalender.steps.ts – Kalender-Panel, Erläuterungen, Datumszeiger
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { When, Then } from '../support/fixtures';

const endetMit = (text: string) => new RegExp(`${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);

When('ich den Kalender öffne', async ({ uhr }) => {
  await uhr.oeffneKalender();
});

Then('zeigt der Kalender {string}', async ({ uhr }, text: string) => {
  await expect(uhr.kalenderPanel).toContainText(text);
});

Then('zeigt der Kalender den Wochentag {string}', async ({ uhr }, wochentag: string) => {
  await expect(uhr.kalenderAngabe(wochentag)).toBeVisible();
});

/**
 * | Osterdatum   | 5. April |
 * | Goldene Zahl | 13       |
 * Bezeichnung = Tooltip der Angabe im Panel, Wert = Ende des angezeigten Texts.
 */
Then('zeigt der Kalender diese Angaben:', async ({ uhr }, tabelle: DataTable) => {
  for (const [bezeichnung, wert] of Object.entries(tabelle.rowsHash())) {
    await expect(uhr.kalenderAngabe(bezeichnung), bezeichnung).toHaveText(endetMit(wert));
  }
});

/** Tabelle mit Kopfzeile | Art | Zeitpunkt |, in der angezeigten Reihenfolge. */
Then('listet der Kalender diese Finsternisse:', async ({ uhr }, tabelle: DataTable) => {
  const zeilen = tabelle.hashes();
  await expect(uhr.finsternisZeilen).toHaveCount(zeilen.length);
  for (const [i, z] of zeilen.entries()) {
    const zeile = uhr.finsternisZeilen.nth(i);
    await expect(zeile).toHaveAttribute('title', z['Art']);
    await expect(zeile).toHaveText(endetMit(z['Zeitpunkt']));
  }
});

When('ich die Erläuterungen zum Kalender öffne', async ({ uhr }) => {
  await uhr.oeffneErlaeuterungen();
});

Then('ergibt der Rechengang den Wochentag {string}', async ({ uhr }, wochentag: string) => {
  await expect(uhr.modal).toContainText(`ist ein ${wochentag}!`);
  await expect(uhr.modal).not.toContainText('nicht vorhanden');
});

Then(
  'zeigt der Zeiger der Kalenderscheibe auf denselben Tag wie im Referenzbild {string}',
  async ({ uhr }, bild: string) => {
    await expect(uhr.page).toHaveScreenshot(`${bild}.png`, {
      clip: await uhr.zeigerAusschnitt(),
      scale: 'device', // volle Auflösung: Ziffern der Tageszeilen bleiben lesbar
      maxDiffPixelRatio: 0.02,
    });
  },
);
