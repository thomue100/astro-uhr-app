// features/steps/feinschliff.steps.ts – Scrollbalken, Symbole, Sprungliste, Gesten-Hinweis
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';

Given('ich nutze einen Computer mit {int} mal {int} Pixeln', async ({ uhr }, breite: number, hoehe: number) => {
  await uhr.nutzeBildschirm(breite, hoehe);
});

Then('braucht die Seite keinen Scrollbalken', async ({ uhr }) => {
  await uhr.warteBisCanvasRuhig();
  // Der Testbrowser blendet Scrollbalken grundsätzlich aus (headless) – daher
  // zusätzlich die CSS-Einstellungen prüfen, die einen Balken bzw. einen
  // freigehaltenen Streifen erzwingen würden.
  const r = await uhr.page.evaluate(() => {
    const html = getComputedStyle(document.documentElement);
    return {
      hoehe: document.documentElement.scrollHeight, fenster: innerHeight,
      overflow: html.overflowY, gutter: html.getPropertyValue('scrollbar-gutter'),
    };
  });
  expect(r.hoehe, 'Seite höher als das Fenster').toBeLessThanOrEqual(r.fenster);
  expect(r.overflow, 'Scrollbalken per CSS dauerhaft eingeschaltet').not.toBe('scroll');
  expect(r.gutter, 'Streifen für den Scrollbalken freigehalten').not.toContain('stable');
});

Then('reicht das Menü bis zur Unterkante der Uhr', async ({ uhr }) => {
  const menue = await uhr.box(uhr.page.locator('#controls'));
  const rahmen = await uhr.box(uhr.canvas);
  expect(Math.abs(menue.y + menue.height - (rahmen.y + rahmen.height))).toBeLessThanOrEqual(2);
});

Then('enthalten die Bedienelemente keine Emoji', async ({ uhr }) => {
  const funde = await uhr.page.locator('button, .controls-header, app-calendar-panel').evaluateAll((els) =>
    els.map((e) => (e as HTMLElement).innerText).filter((t) => /\p{Extended_Pictographic}/u.test(t)));
  expect(funde).toEqual([]);
});

Then('hat das Fenster unter dem Titel nur eine Trennlinie', async ({ uhr }) => {
  await expect(uhr.modal.locator(':scope > hr')).toHaveCount(0);
});

When('ich in der Sprungliste {string} wähle', async ({ uhr }, eintrag: string) => {
  await uhr.modal.getByRole('navigation').getByRole('button', { name: eintrag, exact: true }).click();
});

Then('steht der Abschnitt {string} oben im Fenster und hat den Fokus', async ({ uhr }, titel: string) => {
  const ueberschrift = uhr.modal.getByText(titel, { exact: true });
  await expect(ueberschrift).toBeFocused();
  // weich gescrollt: warten, bis der Abschnitt oben im Fenster angekommen ist
  await expect.poll(async () => {
    const f = await uhr.box(uhr.modal), u = await uhr.box(ueberschrift);
    return u.y - f.y;
  }, { timeout: 5000 }).toBeLessThan(120);
});

Then('zeigt die Kalenderscheibe den Hinweis {string}', async ({ uhr }, text: string) => {
  await expect(uhr.page.locator('.scheiben-hinweis')).toHaveText(text);
});

Then('ist der Hinweis an der Kalenderscheibe verschwunden', async ({ uhr }) => {
  await expect(uhr.page.locator('.scheiben-hinweis')).toHaveCount(0);
});

/** Beobachtet über einen Wechsel hinweg (Bild für Bild) Seitenhöhe und Uhrgröße. */
When('ich beim Umschalten auf {string} Seite und Uhr beobachte', async ({ uhr, ablage }, ziel: string) => {
  await uhr.warteBisCanvasRuhig(); // Einblenden nach dem Laden abwarten – beobachtet wird nur der Wechsel
  await uhr.page.evaluate(() => {
    const w = window as unknown as { __beob: { h: number[]; b: number[] } };
    w.__beob = { h: [], b: [] };
    const t0 = performance.now();
    const bild = () => {
      w.__beob.h.push(document.documentElement.scrollHeight);
      w.__beob.b.push(Math.round(document.querySelector('#canvas')!.getBoundingClientRect().width));
      if (performance.now() - t0 < 900) requestAnimationFrame(bild);
    };
    requestAnimationFrame(bild);
  });
  const knopf = ziel === 'Kalender' ? '#calendarPanel > .controls-header' : '#simulationPanel > .controls-header';
  await uhr.page.locator(knopf).click();
  await uhr.page.waitForTimeout(1000); // Beobachtungszeitraum (Übergänge dauern bis 0,4 s)
  ablage.set('beobachtung', await uhr.page.evaluate(() => (window as unknown as { __beob: unknown }).__beob));
});

Then('ist die Seite dabei nie höher als das Fenster geworden', async ({ uhr, ablage }) => {
  const { h } = ablage.get('beobachtung') as { h: number[] };
  const fenster = uhr.page.viewportSize()!.height;
  expect(Math.max(...h), 'Seite lief kurz über – Scrollbalken blitzt auf').toBeLessThanOrEqual(fenster);
});

Then('hat die Uhr dabei ihre Größe behalten', async ({ ablage }) => {
  const { b } = ablage.get('beobachtung') as { b: number[] };
  expect([...new Set(b)], 'Uhr hat die Größe geändert („wackelt“)').toHaveLength(1);
});
