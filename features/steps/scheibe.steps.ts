// features/steps/scheibe.steps.ts – Kalenderscheibe bedienen (Zoom, Drehen, Verschieben)
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import { winkelAbstand } from '../support/astro-uhr';

Given('ich nutze ein Smartphone', async ({ uhr }) => {
  await uhr.nutzeSmartphone();
});

When('ich die Kalenderscheibe {int}-mal vergrößere', async ({ uhr }, n: number) => {
  for (let i = 0; i < n; i++) await uhr.scheibenButton('Vergrößern').click();
});

When('ich die Kalenderscheibe {int}-mal verkleinere', async ({ uhr }, n: number) => {
  for (let i = 0; i < n; i++) await uhr.scheibenButton('Verkleinern').click();
});

When('ich das Mausrad {int}-mal nach vorn drehe', async ({ uhr }, n: number) => {
  await uhr.mausrad(-n);
});

Then('wird die Kalenderscheibe in Zoomstufe {float} angezeigt', async ({ uhr }, stufe: number) => {
  await expect.poll(async () => (await uhr.scheibenAnsicht()).zoom).toBeCloseTo(stufe, 5);
});

When(
  'ich die Kalenderscheibe mit der Maus um {int} Grad im Uhrzeigersinn drehe',
  async ({ uhr, ablage }, grad: number) => {
    ablage.set('drehungVorher', (await uhr.scheibenAnsicht()).drehung);
    // Start knapp oberhalb der 9-Uhr-Position, damit der Weg nicht über ±180° springt
    await uhr.ziehe(-178, -178 + grad);
  },
);

Then('ist die Kalenderscheibe um {int} Grad im Uhrzeigersinn gedreht', async ({ uhr, ablage }, grad: number) => {
  const vorher = ablage.get('drehungVorher') as number;
  const gedreht = winkelAbstand((await uhr.scheibenAnsicht()).drehung, vorher);
  expect(Math.abs(gedreht - grad), `gedreht um ${gedreht.toFixed(1)}°`).toBeLessThan(2);
});

When('ich in den Verschiebe-Modus wechsle', async ({ uhr }) => {
  await uhr.scheibenButton('Verschieben').click();
});

When(
  'ich die Kalenderscheibe um {int} Pixel nach rechts und {int} Pixel nach unten ziehe',
  async ({ uhr }, dx: number, dy: number) => {
    await uhr.ziehePixel(dx, dy);
  },
);

Then(
  'ist die Kalenderscheibe um {int} Pixel nach rechts und {int} Pixel nach unten verschoben',
  async ({ uhr }, dx: number, dy: number) => {
    const a = await uhr.scheibenAnsicht();
    expect(Math.abs(a.dx - dx), `dx = ${a.dx}`).toBeLessThanOrEqual(2);
    expect(Math.abs(a.dy - dy), `dy = ${a.dy}`).toBeLessThanOrEqual(2);
  },
);

When('ich die Ansicht der Kalenderscheibe zurücksetze', async ({ uhr }) => {
  await uhr.scheibenReset.click();
});

When('ich den Kalender schließe', async ({ uhr }) => {
  await uhr.oeffneKalenderMenue();
  await expect.poll(async () => (await uhr.scheibenAnsicht()).sichtbar).toBe(false);
});

Then('zeigt die Uhr die Kalenderscheibe', async ({ uhr }) => {
  expect((await uhr.scheibenAnsicht()).sichtbar).toBe(true);
});

Then('zeigt die Uhr wieder das Zifferblatt', async ({ uhr }) => {
  expect((await uhr.scheibenAnsicht()).sichtbar).toBe(false);
});

Then('sind die Zoom- und Modusknöpfe der Kalenderscheibe bedienbar', async ({ uhr }) => {
  for (const t of ['Vergrößern', 'Verkleinern', 'Drehen', 'Verschieben']) {
    expect(await uhr.istBedienbar(uhr.scheibenButton(t)), t).toBe(true);
  }
});

Then('sind die Zoom- und Modusknöpfe der Kalenderscheibe nicht bedienbar', async ({ uhr }) => {
  for (const t of ['Vergrößern', 'Verkleinern', 'Drehen', 'Verschieben']) {
    expect(await uhr.istBedienbar(uhr.scheibenButton(t)), t).toBe(false);
  }
});

Then('ist der Knopf zum Zurücksetzen der Kalenderscheibe bedienbar', async ({ uhr }) => {
  await expect.poll(() => uhr.istBedienbar(uhr.scheibenReset)).toBe(true);
});

Then('ist der Knopf zum Zurücksetzen der Kalenderscheibe nicht bedienbar', async ({ uhr }) => {
  await expect.poll(() => uhr.istBedienbar(uhr.scheibenReset)).toBe(false);
});
