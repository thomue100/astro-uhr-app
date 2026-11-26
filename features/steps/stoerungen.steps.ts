// features/steps/stoerungen.steps.ts – Verhalten bei fehlenden Bildern, Daten oder WebGL
import { expect } from '@playwright/test';
import { Given, Then } from '../support/fixtures';

Given('die Bilder der Uhr sind nicht erreichbar', async ({ uhr }) => {
  await uhr.sperreBilderDerUhr();
});

Given('die Kalenderdaten sind nicht erreichbar', async ({ uhr }) => {
  await uhr.sperreKalenderdaten();
});

Given('mein Browser stellt kein WebGL bereit', async ({ uhr }) => {
  await uhr.ohneWebGL();
});

Then('sieht die ganze Uhr aus wie im Referenzbild {string}', async ({ uhr }, bild: string) => {
  await expect(uhr.page).toHaveScreenshot(`${bild}.png`, {
    clip: await uhr.uhrAusschnitt(),
    scale: 'css',
    // Ersatzgrafiken werden exakt reproduzierbar gezeichnet; die Ersatz-Sonne
    // ist nur ~0,4 % der Fläche – 2 % Toleranz würde ihr Fehlen übersehen.
    maxDiffPixelRatio: 0.001,
  });
});

Then('meldet der Kalender {string}', async ({ uhr }, meldung: string) => {
  await expect(uhr.kalenderPanel).toContainText(meldung);
});

Then('meldet das Fenster {string}', async ({ uhr }, meldung: string) => {
  await expect(uhr.modal).toContainText(meldung);
  await expect(uhr.modal, 'Platzhalter statt Text').not.toContainText('undefined');
});

Then('meldet das 3D-Modell {string}', async ({ uhr }, meldung: string) => {
  await expect(uhr.m3dFehler).toContainText(meldung);
});
