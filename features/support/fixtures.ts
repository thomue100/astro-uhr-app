// features/support/fixtures.ts
//
// Gemeinsame Fixtures für alle Gherkin-Szenarien. Neue Fixtures hier ergänzen;
// Schritt-Dateien importieren Given/When/Then immer aus dieser Datei.
import { test as base, createBdd } from 'playwright-bdd';
import { CoverageReport } from 'monocart-coverage-reports';
import { AstroUhr } from './astro-uhr';
import { coverageAktiv, coverageOptionen } from './coverage';

export const test = base.extend<{ uhr: AstroUhr; ablage: Map<string, unknown>; abdeckung: void }>({
  /** Merkzettel pro Szenario, z. B. für Vorher-nachher-Vergleiche. */
  ablage: async ({}, use) => {
    await use(new Map());
  },

  uhr: async ({ page, browser, baseURL }, use) => {
    const uhr = new AstroUhr(page, browser, baseURL);
    await use(uhr);
    await uhr.aufraeumen();
  },

  // Läuft automatisch bei jedem Szenario mit; misst nur bei COVERAGE=1.
  abdeckung: [
    async ({ page }, use) => {
      if (!coverageAktiv) return use();
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      await use();
      const daten = await page.coverage.stopJSCoverage();
      await new CoverageReport(coverageOptionen).add(daten);
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);
