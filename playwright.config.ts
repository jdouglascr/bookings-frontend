import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './apps',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html'], ['json', { outputFile: 'results.json' }]] : [['list'], ['html']],

  use: {
    trace: 'on-first-retry',
  },

  expect: {
    toHaveScreenshot: { maxDiffPixels: 300 },
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
      grep: /@regression|@smoke|@visual/,
      snapshotPathTemplate: '{testDir}/{testFileDir}/../screenshots/desktop/{arg}{ext}',
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@smoke/,
      snapshotPathTemplate: '{testDir}/{testFileDir}/../screenshots/desktop/{arg}{ext}',
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /@smoke/,
      snapshotPathTemplate: '{testDir}/{testFileDir}/../screenshots/desktop/{arg}{ext}',
    },
    {
      name: 'tablet-webkit',
      use: { ...devices['iPad Mini'] },
      grep: /@visual/,
      snapshotPathTemplate: '{testDir}/{testFileDir}/../screenshots/tablet/{arg}{ext}',
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 11'] },
      grep: /@visual/,
      snapshotPathTemplate: '{testDir}/{testFileDir}/../screenshots/mobile/{arg}{ext}',
    },
  ],
});
