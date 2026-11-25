// features/support/mit-abdeckung.mjs
// Startet die Gherkin-Szenarien mit Abdeckungsmessung (COVERAGE=1),
// plattformunabhängig ohne zusätzliches Paket. Weitere Argumente werden
// an Playwright durchgereicht, z. B. --grep @visuell
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['playwright', 'test', '--project=bdd', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, COVERAGE: '1' },
});
process.exit(r.status ?? 1);
