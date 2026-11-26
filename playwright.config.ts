import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * Gherkin-Szenarien (deutsch) aus features/ – playwright-bdd erzeugt daraus
 * Playwright-Tests in .features-gen/. Ausführen: npm run test:bdd
 */
const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['features/support/fixtures.ts', 'features/steps/**/*.ts'],
  language: 'de',
  outputDir: '.features-gen',
});

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**a
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Codeabdeckung der Gherkin-Szenarien (nur mit COVERAGE=1 aktiv) */
  globalSetup: './features/support/coverage-setup.ts',
  globalTeardown: './features/support/coverage-teardown.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      // Gherkin-Szenarien: feste Fenstergröße, Zeitzone und Sprache, damit
      // Referenzbilder (features/referenzbilder/) reproduzierbar bleiben.
      name: 'bdd',
      testDir: bddTestDir,
      // 3D-Modell rendert headless per Software-WebGL – dauert länger als 30 s
      timeout: 60_000,
      snapshotPathTemplate: 'features/referenzbilder/{arg}{ext}',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200',
        viewport: { width: 1400, height: 1000 },
        deviceScaleFactor: 2,
        timezoneId: 'Europe/Berlin',
        locale: 'de-DE',
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start -- --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
