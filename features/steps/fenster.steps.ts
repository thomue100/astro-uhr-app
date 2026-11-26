// features/steps/fenster.steps.ts – Fenster (Einführung, Kunst & Geschichte) und Bildbetrachter
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';

// ── Fenster ─────────────────────────────────────────────────────────────
When('ich das Fenster {string} öffne', async ({ uhr }, name: string) => {
  await uhr.oeffneFenster(name);
});

Then('ist das Fenster {string} geöffnet', async ({ uhr }, titel: string) => {
  await expect(uhr.fenster).toHaveCount(1);
  await expect(uhr.fensterTitel).toHaveText(titel);
});

Then('ist kein Fenster geöffnet', async ({ uhr }) => {
  await expect(uhr.fenster).toHaveCount(0);
});

Then('enthält das Fenster {string}', async ({ uhr }, text: string) => {
  await expect(uhr.modal).toContainText(text);
});

When('ich das Fenster mit dem Kreuz schließe', async ({ uhr }) => {
  await uhr.fensterKreuz.click();
});

When('ich das Kreuz mit der Tastatur betätige', async ({ uhr }) => {
  await uhr.fensterKreuz.focus();
  await expect(uhr.fensterKreuz).toBeFocused();
  await uhr.page.keyboard.press('Enter');
});

When('ich das Fenster mit „Schließen“ schließe', async ({ uhr }) => {
  await uhr.fensterSchliessen.click();
});

When('ich neben das Fenster klicke', async ({ uhr }) => {
  await uhr.klickeNebenDasFenster();
});

When('ich in das Fenster klicke', async ({ uhr }) => {
  await uhr.fensterTitel.click();
});

Then('verdeckt der abgedunkelte Hintergrund den ganzen Bildschirm', async ({ uhr }) => {
  const vp = uhr.page.viewportSize()!;
  const bb = await uhr.box(uhr.page.locator('.modal-overlay'));
  expect([Math.round(bb.x), Math.round(bb.y), Math.round(bb.height)]).toEqual([0, 0, vp.height]);
  // Rechts darf die (am Computer immer eingeblendete) Scrollleiste frei bleiben
  expect(bb.width).toBeGreaterThanOrEqual(vp.width - 20);
});

Then('lässt sich die Seite im Hintergrund nicht scrollen', async ({ uhr }) => {
  expect(await uhr.hintergrundScrollGesperrt()).toBe(true);
});

Then('lässt sich die Seite im Hintergrund wieder scrollen', async ({ uhr }) => {
  expect(await uhr.hintergrundScrollGesperrt()).toBe(false);
});

Then('sind alle Bedienelemente im Fenster mindestens {int} Pixel hoch', async ({ uhr }, min: number) => {
  expect(await uhr.zuKleineBedienelemente(min, uhr.modal)).toEqual([]);
});

// ── Bilder ──────────────────────────────────────────────────────────────
Then(
  'zeigt das Fenster {int} Bilder, jedes mit Titel, Alternativtext und dem Bildnachweis {string}',
  async ({ uhr }, anzahl: number, nachweis: string) => {
    await expect(uhr.bildbetrachter).toHaveCount(anzahl);
    for (const viewer of await uhr.bildbetrachter.all()) {
      await expect(viewer.locator('.iv-caption-title')).not.toBeEmpty();
      await expect(viewer.locator('.iv-caption-credit')).toHaveText(nachweis);
      await expect(viewer.locator('img')).toHaveAttribute('alt', /\S/);
    }
  },
);

Then('lassen sich alle Bilder laden', async ({ uhr }) => {
  expect(await uhr.nichtGeladeneBilder()).toEqual([]);
  await expect(uhr.modal.locator('.iv-error')).toHaveCount(0);
});

Given('das Bild {string} ist nicht erreichbar', async ({ uhr }, datei: string) => {
  await uhr.page.route(`**/${datei}`, (route) => route.abort());
});

Then('meldet der Bildbetrachter {string} für {string}', async ({ uhr }, meldung: string, titel: string) => {
  const viewer = uhr.bild(titel);
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer.locator('.iv-error')).toContainText(meldung);
});

// ── Bildbetrachter bedienen ─────────────────────────────────────────────
When('ich das Bild {string} {int}-mal vergrößere', async ({ uhr }, titel: string, n: number) => {
  const knopf = uhr.bild(titel).getByTitle('Vergrößern', { exact: true });
  for (let i = 0; i < n; i++) await knopf.click();
});

When('ich das Bild {string} {int}-mal verkleinere', async ({ uhr }, titel: string, n: number) => {
  const knopf = uhr.bild(titel).getByTitle('Verkleinern', { exact: true });
  for (let i = 0; i < n; i++) await knopf.click();
});

When('ich das Bild {string} mit dem Mausrad {int}-mal vergrößere', async ({ uhr }, titel: string, n: number) => {
  const buehne = uhr.bild(titel).locator('.iv-stage');
  await buehne.scrollIntoViewIfNeeded();
  await buehne.hover();
  for (let i = 0; i < n; i++) await uhr.page.mouse.wheel(0, -100);
});

When('ich das Bild {string} um {int} Pixel nach rechts ziehe', async ({ uhr }, titel: string, dx: number) => {
  await uhr.ziehePixelIn(uhr.bild(titel).locator('.iv-stage'), dx, 0);
});

When('ich das Bild {string} {int}-mal um {int} Pixel nach rechts ziehe', async ({ uhr }, titel: string, n: number, dx: number) => {
  for (let i = 0; i < n; i++) await uhr.ziehePixelIn(uhr.bild(titel).locator('.iv-stage'), dx, 0);
});

When('ich die Ansicht des Bildes {string} zurücksetze', async ({ uhr }, titel: string) => {
  await uhr.bild(titel).getByTitle('⟲ Ansicht zurücksetzen', { exact: true }).click();
});

Then('wird das Bild {string} {float}-fach vergrößert angezeigt', async ({ uhr }, titel: string, faktor: number) => {
  await expect.poll(async () => (await uhr.bildAnsicht(titel)).s).toBeCloseTo(faktor, 5);
});

Then('ist das Bild {string} um {int} Pixel nach rechts verschoben', async ({ uhr }, titel: string, dx: number) => {
  const a = await uhr.bildAnsicht(titel);
  expect(Math.abs(a.x - dx), `x = ${a.x}`).toBeLessThanOrEqual(2);
  expect(Math.abs(a.y), `y = ${a.y}`).toBeLessThanOrEqual(2);
});

Then('ist das Bild {string} nicht verschoben', async ({ uhr }, titel: string) => {
  const a = await uhr.bildAnsicht(titel);
  expect([a.x, a.y]).toEqual([0, 0]);
});

Then('lässt sich das Bild {string} nicht aus dem Rahmen schieben', async ({ uhr }, titel: string) => {
  // Ein Rest des Bildes (20 % der kürzeren Bühnenseite) bleibt immer sichtbar
  const buehne = await uhr.box(uhr.bild(titel).locator('.iv-stage'));
  const bild = await uhr.box(uhr.bild(titel).locator('img'));
  expect(bild.x, 'Bild ganz rechts aus dem Rahmen').toBeLessThan(buehne.x + buehne.width);
  expect(bild.x + bild.width, 'Bild ganz links aus dem Rahmen').toBeGreaterThan(buehne.x);
});

Then('ist der Bedienhinweis des Bildbetrachters ausgeblendet', async ({ uhr }) => {
  await expect(uhr.bildbetrachter.first().locator('.iv-hint')).toBeHidden();
});

Then('kommt im Fenster der Text {string} genau einmal vor', async ({ uhr }, text: string) => {
  const inhalt = await uhr.modal.innerText();
  expect(inhalt.split(text).length - 1, `Anzahl von „${text}“`).toBe(1);
});

Then('kommt im Fenster der Text {string} nicht vor', async ({ uhr }, text: string) => {
  await expect(uhr.modal).not.toContainText(text);
});
