// features/steps/touch.steps.ts – Finger-Gesten auf Kalenderscheibe und Bildbetrachter
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import type { AstroUhr } from '../support/astro-uhr';

type Punkt = [number, number];
const SCHRITTE = 10;
const rad = (g: number) => (g * Math.PI) / 180;
/** n gleichmäßige Zwischenschritte von 0 bis 1 (ohne 0). */
const verlauf = (n = SCHRITTE) => Array.from({ length: n }, (_, i) => (i + 1) / n);

/** Zwei Finger symmetrisch zur Mitte, Abstand 2·a, unter dem Winkel w (Grad). */
const zweiFinger = (cx: number, cy: number, a: number, w = 0): Punkt[] => [
  [cx - a * Math.cos(rad(w)), cy - a * Math.sin(rad(w))],
  [cx + a * Math.cos(rad(w)), cy + a * Math.sin(rad(w))],
];

async function merkeScheibe(uhr: AstroUhr, ablage: Map<string, unknown>): Promise<void> {
  ablage.set('drehungVorher', (await uhr.scheibenAnsicht()).drehung);
  ablage.set('scheibe', await uhr.scheibenAnsicht());
}

Given('ich nutze ein Tablet', async ({ uhr }) => {
  await uhr.nutzeTablet();
});

// ── Kalenderscheibe ─────────────────────────────────────────────────────
When(
  'ich die Kalenderscheibe mit zwei Fingern um {int} Pixel nach rechts und {int} Pixel nach unten schiebe',
  async ({ uhr, ablage }, dx: number, dy: number) => {
    await merkeScheibe(uhr, ablage);
    const { cx, cy, r } = await uhr.gestenMass();
    await uhr.beruehre([zweiFinger(cx, cy, r / 3), ...verlauf().map((t) => zweiFinger(cx + dx * t, cy + dy * t, r / 3))]);
  },
);

When(
  'ich die Kalenderscheibe mit zwei Fingern um {int} Grad im Uhrzeigersinn drehe',
  async ({ uhr, ablage }, grad: number) => {
    await merkeScheibe(uhr, ablage);
    const { cx, cy, r } = await uhr.gestenMass();
    await uhr.beruehre([zweiFinger(cx, cy, r / 3), ...verlauf().map((t) => zweiFinger(cx, cy, r / 3, grad * t))]);
  },
);

When(
  'ich die Kalenderscheibe mit einem Finger um {int} Pixel nach rechts und {int} Pixel nach unten schiebe',
  async ({ uhr, ablage }, dx: number, dy: number) => {
    await merkeScheibe(uhr, ablage);
    const { cx, cy } = await uhr.gestenMass();
    await uhr.beruehre([[[cx, cy]], ...verlauf().map((t): Punkt[] => [[cx + dx * t, cy + dy * t]])]);
  },
);

When(
  'ich die Kalenderscheibe mit zwei Fingern auf das {float}-fache aufziehe, einen Finger anhebe und mit dem anderen um {int} Grad im Uhrzeigersinn weiterdrehe',
  async ({ uhr, ablage }, faktor: number, grad: number) => {
    await merkeScheibe(uhr, ablage);
    const { cx, cy, r } = await uhr.gestenMass();
    const a = r / 3, ende = a * faktor;
    // Aufziehen mit zwei Fingern, waagerecht durch die Mitte
    const aufziehen = [zweiFinger(cx, cy, a), ...verlauf().map((t) => zweiFinger(cx, cy, a * (1 + (faktor - 1) * t)))];
    // Rechter Finger hebt ab; der linke (9-Uhr-Position) dreht auf einem Kreis weiter
    const links = (g: number): Punkt => [cx + ende * Math.cos(rad(180 + g)), cy + ende * Math.sin(rad(180 + g))];
    const weiter = [[links(0)], ...verlauf().map((t) => [links(grad * t)])];
    await uhr.beruehre([...aufziehen, ...weiter]);
  },
);

When('ich mit einem Finger über die Uhr wische', async ({ uhr, ablage }) => {
  await merkeScheibe(uhr, ablage);
  const { cx, cy, r } = await uhr.gestenMass();
  await uhr.beruehre([[[cx - r, cy]], ...verlauf().map((t): Punkt[] => [[cx - r + 2 * r * t, cy + r * t]])]);
});

Then('ist die Kalenderscheibe unverändert', async ({ uhr, ablage }) => {
  expect(await uhr.scheibenAnsicht()).toEqual(ablage.get('scheibe'));
});

// ── Bildbetrachter ──────────────────────────────────────────────────────
async function buehnenMitte(uhr: AstroUhr, titel: string): Promise<{ cx: number; cy: number; a: number }> {
  const buehne = await uhr.bildBereit(titel);
  const bb = await uhr.box(buehne);
  return { cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2, a: bb.width / 8 };
}

When('ich das Bild {string} mit einem Finger um {int} Pixel nach rechts schiebe', async ({ uhr }, titel: string, dx: number) => {
  const { cx, cy } = await buehnenMitte(uhr, titel);
  await uhr.beruehreElement(uhr.bild(titel).locator('.iv-stage'),
    [[[cx, cy]], ...verlauf().map((t): Punkt[] => [[cx + dx * t, cy]])]);
});

When('ich das Bild {string} mit zwei Fingern um {int} Pixel nach rechts schiebe', async ({ uhr }, titel: string, dx: number) => {
  const { cx, cy, a } = await buehnenMitte(uhr, titel);
  await uhr.beruehreElement(uhr.bild(titel).locator('.iv-stage'),
    [zweiFinger(cx, cy, a), ...verlauf().map((t) => zweiFinger(cx + dx * t, cy, a))]);
});

When('ich das Bild {string} mit zwei Fingern auf das {float}-fache aufziehe', async ({ uhr }, titel: string, faktor: number) => {
  const { cx, cy, a } = await buehnenMitte(uhr, titel);
  await uhr.beruehreElement(uhr.bild(titel).locator('.iv-stage'),
    [zweiFinger(cx, cy, a), ...verlauf().map((t) => zweiFinger(cx, cy, a * (1 + (faktor - 1) * t)))]);
});

When(
  'ich das Bild {string} mit zwei Fingern auf das {float}-fache aufziehe, einen Finger anhebe und mit dem anderen um {int} Pixel nach rechts schiebe',
  async ({ uhr }, titel: string, faktor: number, dx: number) => {
    const { cx, cy, a } = await buehnenMitte(uhr, titel);
    const ende = a * faktor;
    await uhr.beruehreElement(uhr.bild(titel).locator('.iv-stage'), [
      zweiFinger(cx, cy, a),
      ...verlauf().map((t) => zweiFinger(cx, cy, a * (1 + (faktor - 1) * t))),
      [[cx - ende, cy]],
      ...verlauf().map((t): Punkt[] => [[cx - ende + dx * t, cy]]),
    ]);
  },
);

Given('das Bild {string} lädt langsam', async ({ uhr }, datei: string) => {
  await uhr.page.route(`**/${datei}`, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });
});

When('ich das Bild {string} noch während des Ladens mit zwei Fingern auf das {float}-fache aufziehe', async ({ uhr }, titel: string, faktor: number) => {
  const buehne = uhr.bild(titel).locator('.iv-stage');
  await buehne.scrollIntoViewIfNeeded();
  const geladen = await uhr.bild(titel).locator('img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0);
  expect(geladen, 'Foto ist schon geladen – die Probe prüft dann nichts').toBe(false);
  const bb = await uhr.box(buehne);
  const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2, a = bb.width / 8;
  await uhr.beruehreElement(buehne, [zweiFinger(cx, cy, a), ...verlauf().map((t) => zweiFinger(cx, cy, a * (1 + (faktor - 1) * t)))]);
});

When('das Bild {string} fertig geladen ist', async ({ uhr }, titel: string) => {
  await uhr.bildBereit(titel);
});
