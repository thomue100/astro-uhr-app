// features/steps/mobil.steps.ts – Layout und Touch-Bedienung auf dem Smartphone
import { expect } from '@playwright/test';
import { When, Then } from '../support/fixtures';

Then('steht die Uhr über dem Menü', async ({ uhr }) => {
  const uhrBox = await uhr.box(uhr.canvas), menue = await uhr.box(uhr.menue);
  expect(uhrBox.y + uhrBox.height, 'Uhr endet unterhalb des Menüanfangs').toBeLessThanOrEqual(menue.y + 1);
});

Then('steht das Menü links neben der Uhr', async ({ uhr }) => {
  const uhrBox = await uhr.box(uhr.canvas), menue = await uhr.box(uhr.menue);
  expect(menue.x + menue.width, 'Menü reicht in die Uhr hinein').toBeLessThanOrEqual(uhrBox.x + 1);
  expect(Math.abs(menue.y - uhrBox.y), 'Menü und Uhr beginnen nicht auf gleicher Höhe').toBeLessThan(80);
});

Then('nutzt die Uhr mindestens {int} % der Bildschirmbreite', async ({ uhr }, prozent: number) => {
  const breite = uhr.page.viewportSize()!.width;
  const bb = await uhr.box(uhr.canvas);
  expect(bb.width / breite).toBeGreaterThanOrEqual(prozent / 100);
  expect(bb.x, 'Uhr ragt links aus dem Bild').toBeGreaterThanOrEqual(0);
  expect(bb.x + bb.width, 'Uhr ragt rechts aus dem Bild').toBeLessThanOrEqual(breite);
});

Then('lässt sich die Seite nicht seitlich verschieben', async ({ uhr }) => {
  expect(await uhr.seitlichVerschiebbar()).toBe(false);
});

Then('sind alle Knöpfe und Menüpunkte mindestens {int} Pixel hoch', async ({ uhr }, min: number) => {
  expect(await uhr.zuKleineBedienelemente(min)).toEqual([]);
});

When('ich die Einführung öffne', async ({ uhr }) => {
  await uhr.einfuehrung.click();
  await expect(uhr.modal).toBeVisible();
});

Then('passt das geöffnete Fenster auf den Bildschirm', async ({ uhr }) => {
  const vp = uhr.page.viewportSize()!;
  const bb = await uhr.box(uhr.modal);
  expect(bb.x).toBeGreaterThanOrEqual(0);
  expect(bb.y).toBeGreaterThanOrEqual(0);
  expect(bb.x + bb.width).toBeLessThanOrEqual(vp.width);
  expect(bb.y + bb.height).toBeLessThanOrEqual(vp.height);
});

// ── Gesten auf der Kalenderscheibe ──────────────────────────────────────
When('ich mir die Stellung der Kalenderscheibe merke', async ({ uhr, ablage }) => {
  ablage.set('scheibe', await uhr.scheibenAnsicht());
});

Then('steht die Kalenderscheibe wieder wie gemerkt', async ({ uhr, ablage }) => {
  const vorher = ablage.get('scheibe') as Awaited<ReturnType<typeof uhr.scheibenAnsicht>>;
  const jetzt = await uhr.scheibenAnsicht();
  expect(jetzt.drehung).toBeCloseTo(vorher.drehung, 6);
  expect([jetzt.zoom, jetzt.dx, jetzt.dy]).toEqual([vorher.zoom, vorher.dx, vorher.dy]);
});

When(
  'ich die Kalenderscheibe mit einem Finger um {int} Grad im Uhrzeigersinn drehe',
  async ({ uhr, ablage }, grad: number) => {
    ablage.set('drehungVorher', (await uhr.scheibenAnsicht()).drehung);
    const { cx, cy, r } = await uhr.gestenMass();
    const bilder: Array<Array<[number, number]>> = [];
    for (let i = 0; i <= 10; i++) {
      const g = ((-178 + (grad * i) / 10) * Math.PI) / 180;
      bilder.push([[cx + r * Math.cos(g), cy + r * Math.sin(g)]]);
    }
    await uhr.beruehre(bilder);
  },
);

When('ich die Kalenderscheibe mit zwei Fingern auf das {float}-fache aufziehe', async ({ uhr }, faktor: number) => {
  const { cx, cy, r } = await uhr.gestenMass();
  const a = r / 3, bilder: Array<Array<[number, number]>> = [];
  // Finger waagerecht, symmetrisch um die Mitte: weder Drehung noch Verschiebung
  for (let i = 0; i <= 10; i++) {
    const d = a * (1 + ((faktor - 1) * i) / 10);
    bilder.push([[cx - d, cy], [cx + d, cy]]);
  }
  await uhr.beruehre(bilder);
});
