// features/support/coverage-setup.ts – leert vor dem Lauf die Messdaten
import { CoverageReport } from 'monocart-coverage-reports';
import { coverageAktiv, coverageOptionen } from './coverage';

export default async function globalSetup(): Promise<void> {
  if (coverageAktiv) new CoverageReport(coverageOptionen).cleanCache();
}
