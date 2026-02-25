import { defineConfig, devices, type PlaywrightTestOptions } from '@playwright/test';

/**
 * Playwright config for host machine testing
 * Uses localhost:8000 by default
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: false, // Allow test.only for debugging
  retries: 0, // No retries for local debugging
  workers: process.env.CI ? 8 : 8, // Use 8 workers both locally and in CI
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          headless: false, // Show browser window
          args: ['--window-position=100,100'], // Force position on monitor 1
          slowMo: 0, // Add 100ms delay between actions
        },
      },
    }
  ],
});
