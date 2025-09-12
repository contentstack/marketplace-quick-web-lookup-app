import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: './e2e/tests',
  testMatch: '*.spec.ts',
  timeout: 30 * 10000,
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 0,
    screenshot: 'off',
    video: 'off',
    viewport: { width: 1920, height: 720 },
    trace: 'on-first-retry',
    baseURL: process.env.ENV_URL || 'https://app.contentstack.com',
    storageState: 'storageState.json',
    javaScriptEnabled: true,
    launchOptions: {
      logger: {
        isEnabled: () => {
          return false;
        },
        log: (name, severity, message, args) => console.log(`${name}: ${message}`),
      },
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
      },
    },
    {
      name: 'safari',
      use: {
        ...devices['Desktop Safari'],
        // Safari-specific settings
        viewport: { width: 1920, height: 720 },
        // Increase timeouts for Safari which can be slower
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
      },
    },
  ],
};

export default config;
