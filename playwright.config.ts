import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const previewPort = new URL(baseURL).port || '4173';

/*
  Visual snapshots are pixel-compared against baselines generated in the
  Playwright container (see scripts/visual-baseline.sh). Any host whose font
  rendering differs from that image fails every snapshot, so the project is
  opt-in rather than part of the default `playwright test` run — which would
  otherwise execute every declared project.
*/
const visualProject = {
  name: 'visual',
  testMatch: /visual\.spec\.ts/,
  use: { ...devices['Desktop Chrome'] }
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox-smoke',
      testMatch: /cross-browser-smoke\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit-smoke',
      testMatch: /cross-browser-smoke\.spec\.ts/,
      use: { ...devices['Desktop Safari'] }
    },
    ...(process.env.PLAYWRIGHT_VISUAL ? [visualProject] : [])
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI
  }
});
