// features/support/coverage.ts
//
// Codeabdeckung der Gherkin-Szenarien: Chromium misst per V8, welche Teile
// des ausgelieferten JavaScripts laufen; monocart rechnet das über die
// Source-Maps des Dev-Servers auf die TypeScript-Dateien in src/app zurück.
// Aktiv nur mit COVERAGE=1 (npm run test:bdd:coverage).
import type { CoverageReportOptions } from 'monocart-coverage-reports';

export const coverageAktiv = !!process.env['COVERAGE'];

export const coverageOptionen: CoverageReportOptions = {
  name: 'Abdeckung der Gherkin-Szenarien',
  outputDir: './coverage-bdd',
  reports: [['v8'], ['console-summary'], ['json-summary'], ['lcovonly'], ['console-details', { skipPercent: 0 }]],
  // Nur das App-Bundle des Dev-Servers, keine Vite-/Angular-Hilfsskripte
  entryFilter: (entry) => entry.url.startsWith('http://localhost:4200/') && !entry.url.includes('/@'),
  // Nur eigener Code, keine node_modules, keine Unit-Tests
  sourceFilter: (sourcePath) =>
    sourcePath.includes('src/app/') && !sourcePath.endsWith('.spec.ts'),
  sourcePath: (filePath) => filePath.replace(/^.*?(src\/app\/)/, '$1'),
};
