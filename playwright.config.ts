import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Use 2 workers in CI, 8 workers locally for maximum performance */
  workers: process.env.CI ? 1 : 8,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'html' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Global timeout settings - reduced for faster feedback */
    actionTimeout: 5000,
    navigationTimeout: 15000,

    /* Visual testing configuration */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/functional/*.spec.ts',
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific optimizations for stability
        launchOptions: {
          firefoxUserPrefs: {
            'dom.disable_beforeunload': true,
            'dom.max_script_run_time': 0,
            'dom.max_chrome_script_run_time': 0,
            'browser.dom.window.dump.enabled': true,
            'devtools.console.stdout.chrome': true,
          }
        }
      },
      testMatch: '**/functional/full-*.spec.ts', // Only run full game scenarios in Firefox
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/functional/*.spec.ts',
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/functional/game-setup.spec.ts', // Only run game setup tests on mobile
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: '**/functional/game-setup.spec.ts', // Only run game setup tests on mobile
    },

    /* Visual regression testing projects */
    {
      name: 'visual-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Visual testing specific settings
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      testMatch: '**/visual/visual-*.spec.ts',
      testIgnore: '**/functional-*.spec.ts',
    },

    {
      name: 'visual-mobile',
      use: { 
        ...devices['Pixel 5'],
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      testMatch: '**/visual/visual-*.spec.ts',
      testIgnore: '**/functional-*.spec.ts',
    },

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
    command: 'NODE_ENV=test npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
