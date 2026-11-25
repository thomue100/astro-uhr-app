// features/support/coverage-teardown.ts – erzeugt nach dem Lauf den Bericht
import { CoverageReport } from 'monocart-coverage-reports';
import { coverageAktiv, coverageOptionen } from './coverage';

export default async function globalTeardown(): Promise<void> {
  if (coverageAktiv) await new CoverageReport(coverageOptionen).generate();
}
