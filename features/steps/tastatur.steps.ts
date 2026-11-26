// features/steps/tastatur.steps.ts – Bedienung mit der Tastatur
import { expect } from '@playwright/test';
import { When, Then } from '../support/fixtures';
import type { AstroUhr } from '../support/astro-uhr';

const TABS = 25;

/** Text für einen regulären Ausdruck unschädlich machen. */
const woertlich = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Menüpunkt als Knopf über seine sichtbare Beschriftung. */
const menuepunkt = (uhr: AstroUhr, name: string) =>
  uhr.menue.getByRole('button', { name: new RegExp(woertlich(name)) }).first();

// ── Tab-Reihenfolge ─────────────────────────────────────────────────────
Then('erreicht die Tab-Taste nur sichtbare Bedienelemente', async ({ uhr }) => {
  const reihe = await uhr.tabReihenfolge(TABS);
  const unsichtbar = reihe.filter((e) => !e.sichtbar).map((e) => e.name);
  expect(unsichtbar, 'per Tab erreichbar, aber nicht zu sehen').toEqual([]);
});

Then('erreicht die Tab-Taste {string}', async ({ uhr }, name: string) => {
  const reihe = await uhr.tabReihenfolge(TABS);
  expect(reihe.filter((e) => e.sichtbar).map((e) => e.name)).toContainEqual(expect.stringContaining(name));
});

Then('erreicht die Tab-Taste {string} nicht', async ({ uhr }, name: string) => {
  const reihe = await uhr.tabReihenfolge(TABS);
  expect(reihe.map((e) => e.name)).not.toContainEqual(expect.stringContaining(name));
});

// ── Menüpunkte ──────────────────────────────────────────────────────────
When('ich den Menüpunkt {string} per Tastatur betätige', async ({ uhr }, name: string) => {
  await menuepunkt(uhr, name).focus();
  await uhr.page.keyboard.press('Enter');
});

When('ich den Menüpunkt {string} mit der Leertaste betätige', async ({ uhr }, name: string) => {
  await menuepunkt(uhr, name).focus();
  await uhr.page.keyboard.press('Space');
});

Then('ist der Menüpunkt {string} als aufgeklappt gekennzeichnet', async ({ uhr }, name: string) => {
  await expect(menuepunkt(uhr, name)).toHaveAttribute('aria-expanded', 'true');
});

Then('ist der Menüpunkt {string} als zugeklappt gekennzeichnet', async ({ uhr }, name: string) => {
  await expect(menuepunkt(uhr, name)).toHaveAttribute('aria-expanded', 'false');
});

// ── Fokus und Fenster ───────────────────────────────────────────────────
Then('liegt der Fokus auf {string}', async ({ uhr }, name: string) => {
  await expect.poll(() => uhr.page.evaluate(() => {
    const e = document.activeElement as HTMLElement | null;
    // <body> = kein Element fokussiert (sein Text enthielte sonst jedes Wort der Seite)
    if (!e || e === document.body) return '(kein Element fokussiert)';
    return (e.getAttribute('aria-label') || e.textContent || '').trim();
  })).toContain(name);
});

Then('bleibt der Fokus beim Tabben im Fenster', async ({ uhr }) => {
  for (const taste of [...Array(15).fill('Tab'), ...Array(15).fill('Shift+Tab')]) {
    await uhr.page.keyboard.press(taste);
    const imFenster = await uhr.page.evaluate(() => !!document.activeElement?.closest('.modal-content'));
    expect(imFenster, `Fokus nach ${taste} außerhalb des Fensters`).toBe(true);
  }
});

Then('ist das Fenster als Dialog mit dem Titel {string} gekennzeichnet', async ({ uhr }, titel: string) => {
  await expect(uhr.page.getByRole('dialog', { name: titel })).toBeVisible();
});
