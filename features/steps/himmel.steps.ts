// features/steps/himmel.steps.ts – Sonnenzeiger, Tierkreis, Mond
import { expect } from '@playwright/test';
import { Given, Then } from '../support/fixtures';
import type { AstroUhr } from '../support/astro-uhr';

const MONAT = (19 * 365.25) / 235; // mittlerer synodischer Monat in Tagen

Given('mein Gerät ist auf die Zeitzone {string} eingestellt', async ({ uhr }, zeitzone: string) => {
  await uhr.nutzeZeitzone(zeitzone);
});

// ── Sonnenzeiger ────────────────────────────────────────────────────────
Then('zeigt der Sonnenzeiger auf {string} Uhr', async ({ uhr }, zeit: string) => {
  const [h, m] = zeit.split(':').map(Number);
  const soll = h + m / 60;
  const ist = await uhr.stundeDesSonnenzeigers();
  // Abstand auf dem 24-Stunden-Ring (23:59 und 00:00 liegen nebeneinander)
  const abstand = Math.abs(((ist - soll + 36) % 24) - 12);
  expect(abstand, `Sonnenzeiger zeigt ${ist.toFixed(2)} statt ${soll.toFixed(2)} Uhr`).toBeLessThan(2 / 60);
});

// ── Tierkreis ───────────────────────────────────────────────────────────
Then('steht die Sonne im Sternbild {string}', async ({ uhr }, sternbild: string) => {
  expect(await uhr.sternbildDerSonne()).toBe(sternbild);
});

// ── Mond ────────────────────────────────────────────────────────────────
/** Erwartetes Mondalter je Phase; Toleranz 1 Tag, weil die Uhr – wie das
 *  Original-Räderwerk – mit dem mittleren Mondlauf rechnet und der wahre Mond
 *  bis zu ~15 Stunden davon abweicht. */
async function pruefeMondalter(uhr: AstroUhr, soll: number): Promise<void> {
  const alter = await uhr.mondalter();
  // Abstand im Mondzyklus (29,5 und 0 liegen nebeneinander)
  const abstand = Math.abs(((alter - soll + MONAT * 1.5) % MONAT) - MONAT / 2);
  expect(abstand, `Mondalter ${alter.toFixed(2)} Tage, erwartet ${soll.toFixed(2)} ± 1`).toBeLessThanOrEqual(1);
}

async function pruefeMondalterZwischen(uhr: AstroUhr, von: number, bis: number): Promise<void> {
  const alter = await uhr.mondalter();
  expect(alter, `Mondalter ${alter.toFixed(2)} Tage`).toBeGreaterThan(von);
  expect(alter, `Mondalter ${alter.toFixed(2)} Tage`).toBeLessThan(bis);
}

Then('ist Neumond', async ({ uhr }) => pruefeMondalter(uhr, 0));
Then('ist Vollmond', async ({ uhr }) => pruefeMondalter(uhr, MONAT / 2));
Then('nimmt der Mond zu', async ({ uhr }) => pruefeMondalterZwischen(uhr, 1, MONAT / 2 - 1));
Then('nimmt der Mond ab', async ({ uhr }) => pruefeMondalterZwischen(uhr, MONAT / 2 + 1, MONAT - 1));

Then('steht der Mond der Sonne gegenüber', async ({ uhr }) => {
  const d = await uhr.mondSonneAbstand();
  expect(Math.abs(d), `Mond ${d.toFixed(1)}° von der Sonne entfernt`).toBeGreaterThan(165);
});

Then('steht der Mond bei der Sonne', async ({ uhr }) => {
  const d = await uhr.mondSonneAbstand();
  expect(Math.abs(d), `Mond ${d.toFixed(1)}° von der Sonne entfernt`).toBeLessThan(15);
});

// ── Visuelle Prüfungen ──────────────────────────────────────────────────
Then('sieht der Bereich um den Sonnenzeiger aus wie im Referenzbild {string}', async ({ uhr }, bild: string) => {
  await expect(uhr.page).toHaveScreenshot(`${bild}.png`, {
    clip: await uhr.sonnenAusschnitt(),
    maxDiffPixelRatio: 0.02,
  });
});

Then('sieht der untere Bereich der Uhr aus wie im Referenzbild {string}', async ({ uhr }, bild: string) => {
  await expect(uhr.page).toHaveScreenshot(`${bild}.png`, {
    clip: await uhr.untererAusschnitt(),
    maxDiffPixelRatio: 0.02,
  });
});
