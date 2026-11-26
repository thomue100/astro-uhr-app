// features/steps/modell3d.steps.ts – 3D-Funktionsmodell des Räderwerks
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import { AstroUhr, parseDatum } from '../support/astro-uhr';

const TAG = 24 * 3600_000;
/** Beschriftungen ändern sich erst mit dem nächsten WebGL-Bild; headless unter Last dauert das. */
const BILD = { timeout: 15_000 };

Given('mein Gerät bevorzugt reduzierte Bewegung', async ({ uhr }) => {
  await uhr.bevorzugeReduzierteBewegung();
});

When('ich das 3D-Modell öffne', async ({ uhr }) => {
  await uhr.oeffne3dModell();
});

When('ich zur Uhr zurückkehre', async ({ uhr }) => {
  await uhr.m3dZurueck.click();
});

When('ich die Escape-Taste drücke', async ({ uhr }) => {
  await uhr.page.keyboard.press('Escape');
});

Then('zeigt der Rahmen das 3D-Modell', async ({ uhr }) => {
  await expect(uhr.m3dBild).toBeVisible();
  await expect(uhr.m3dFehler, 'WebGL nicht verfügbar').toHaveCount(0);
  await expect(uhr.canvas).toBeHidden();
});

Then('ersetzt das Bedienfeld des 3D-Modells das Menü', async ({ uhr }) => {
  await expect(uhr.m3dPanel).toBeVisible();
  await expect(uhr.m3dZurueck).toBeVisible();
  await expect(uhr.einfuehrung).toHaveCount(0);
});

Then('zeigt der Rahmen wieder die Uhr mit dem Menü', async ({ uhr }) => {
  await expect(uhr.canvas).toBeVisible();
  await expect(uhr.m3dBild).toHaveCount(0);
  await expect(uhr.m3dPanel).toHaveCount(0);
  await expect(uhr.einfuehrung).toBeVisible();
});

// ── Zeit im Modell ──────────────────────────────────────────────────────
Then('ist die Uhr im 3D-Modell auf {string} MEZ gestellt', async ({ uhr }, zeitpunkt: string) => {
  // Angabe in Lübecker Ortszeit (im Winter = MEZ); Feld zeigt MEZ
  await expect(uhr.m3dUhrStellen).toHaveValue(AstroUhr.alsMezFeldwert(parseDatum(zeitpunkt)));
});

Then('läuft das 3D-Modell mit {string}', async ({ uhr }, geschwindigkeit: string) => {
  await expect(uhr.m3dLaufKnopf).toHaveAttribute('aria-pressed', 'true');
  await expect(uhr.m3dGeschwindigkeit.locator('option:checked')).toHaveText(geschwindigkeit);
});

When('ich das 3D-Modell anhalte', async ({ uhr }) => {
  await expect(uhr.m3dLaufKnopf).toHaveAttribute('aria-pressed', 'true');
  await uhr.m3dLaufKnopf.click();
});

When('ich das 3D-Modell weiterlaufen lasse', async ({ uhr }) => {
  await expect(uhr.m3dLaufKnopf).toHaveAttribute('aria-pressed', 'false');
  await uhr.m3dLaufKnopf.click();
});

When('ich die Geschwindigkeit des 3D-Modells auf {string} stelle', async ({ uhr }, geschwindigkeit: string) => {
  await uhr.m3dGeschwindigkeit.selectOption({ label: geschwindigkeit });
});

When('ich die Uhr im 3D-Modell auf {string} stelle', async ({ uhr }, zeitpunkt: string) => {
  await uhr.m3dUhrStellen.fill(AstroUhr.alsMezFeldwert(parseDatum(zeitpunkt)));
  await uhr.m3dUhrStellen.blur();
});

When('ich im 3D-Modell auf „Jetzt“ klicke', async ({ uhr }) => {
  await uhr.m3dKnopf('Jetzt').click();
});

Then('steht die Zeit im 3D-Modell still', async ({ uhr }) => {
  await expect(uhr.m3dLaufKnopf).toHaveAttribute('aria-pressed', 'false');
  const vorher = await uhr.m3dZeitpunkt();
  await uhr.page.waitForTimeout(1200); // Feld wird alle 0,5 s nachgeführt – länger beobachten
  expect((await uhr.m3dZeitpunkt()).getTime()).toBe(vorher.getTime());
});

Then('rückt die Uhr im 3D-Modell um mindestens {int} Tag(e) vor', async ({ uhr }, tage: number) => {
  const start = (await uhr.m3dZeitpunkt()).getTime();
  await expect
    .poll(async () => ((await uhr.m3dZeitpunkt()).getTime() - start) / TAG, { timeout: 20_000 })
    .toBeGreaterThanOrEqual(tage);
});

Then('rückt die Uhr im 3D-Modell vor', async ({ uhr }) => {
  const start = (await uhr.m3dZeitpunkt()).getTime();
  await expect.poll(async () => (await uhr.m3dZeitpunkt()).getTime() - start, { timeout: 10_000 }).toBeGreaterThan(0);
});

// ── Darstellung ─────────────────────────────────────────────────────────
When('ich im 3D-Modell {string} umschalte', async ({ uhr }, name: string) => {
  await uhr.m3dKnopf(name).click();
});

Then('ist im 3D-Modell {string} eingeschaltet', async ({ uhr }, name: string) => {
  await expect(uhr.m3dKnopf(name)).toHaveAttribute('aria-pressed', 'true');
});

Then('ist im 3D-Modell {string} ausgeschaltet', async ({ uhr }, name: string) => {
  await expect(uhr.m3dKnopf(name)).toHaveAttribute('aria-pressed', 'false');
});

Then('zeigt das 3D-Modell Beschriftungen', async ({ uhr }) => {
  await expect.poll(async () => (await uhr.sichtbareBeschriftungen()).length, BILD).toBeGreaterThan(0);
});

Then('zeigt das 3D-Modell keine Beschriftungen', async ({ uhr }) => {
  await expect.poll(async () => (await uhr.sichtbareBeschriftungen()).length, BILD).toBe(0);
});

Then('zeigt das 3D-Modell die Beschriftung {string}', async ({ uhr }, text: string) => {
  await expect.poll(async () => (await uhr.sichtbareBeschriftungen()).map((b) => b.text), BILD).toContain(text);
});

When('ich mir die sichtbaren Beschriftungen merke', async ({ uhr, ablage }) => {
  await uhr.page.waitForTimeout(800); // Kamerafahrt der Startansicht abwarten
  ablage.set('beschriftungen', await uhr.sichtbareBeschriftungen());
});

Then('sind im 3D-Modell mehr Beschriftungen sichtbar als vorher', async ({ uhr, ablage }) => {
  const vorher = (ablage.get('beschriftungen') as unknown[]).length;
  await expect.poll(async () => (await uhr.sichtbareBeschriftungen()).length, BILD).toBeGreaterThan(vorher);
});

When('ich die Ansicht {string} wähle', async ({ uhr }, ansicht: string) => {
  await uhr.m3dKnopf(ansicht).click();
});

Then('hat sich die Kamera bewegt', async ({ uhr, ablage }) => {
  const vorher = JSON.stringify(ablage.get('beschriftungen'));
  await expect.poll(async () => JSON.stringify(await uhr.sichtbareBeschriftungen()), { timeout: 5000 }).not.toBe(vorher);
});

Then('ist der Bedienhinweis des 3D-Modells ausgeblendet', async ({ uhr }) => {
  await expect(uhr.m3dHinweis).toBeHidden();
});

Then('ist der Bedienhinweis des 3D-Modells zu sehen', async ({ uhr }) => {
  await expect(uhr.m3dHinweis).toBeVisible();
});
