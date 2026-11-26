// features/steps/barrierefreiheit.steps.ts – automatische Prüfung (axe-core) und Textalternativen
import { expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { Then } from '../support/fixtures';

/** WCAG 2.0–2.2, Stufen A und AA, dazu die Empfehlungen („best practice“) von axe. */
const REGELN = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

Then('findet die automatische Barrierefreiheitsprüfung keine Verstöße', async ({ uhr }) => {
  const ergebnis = await new AxeBuilder({ page: uhr.page }).withTags(REGELN).analyze();
  const verstoesse = ergebnis.violations.map((v) =>
    `${v.id} (${v.impact}): ${v.help} – ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
  expect(verstoesse, 'axe-core meldet Verstöße').toEqual([]);
});

Then('ist die Seitensprache {string}', async ({ uhr }, sprache: string) => {
  await expect(uhr.page.locator('html')).toHaveAttribute('lang', sprache);
});

Then('beschreibt die Textalternative der Uhr {string}', async ({ uhr }, text: string) => {
  await expect(uhr.page.getByRole('img', { name: new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeVisible();
});
