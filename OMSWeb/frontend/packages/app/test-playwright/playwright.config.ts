// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 15 * 1000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 8,
  use: {
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: 75
    },
    viewport: {
      width: 1920,
      height: 1080,
    }
  },
  projects: [
    {
      name: 'chromium',
      // use: { ...devices['Desktop Chrome'] },
    },
  ],
};
export default config;
