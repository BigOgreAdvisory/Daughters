import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.js/,
  timeout: 180_000,
  fullyParallel: true,
  workers: 6,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/Daughters/',
    browserName: 'chromium',
    channel: 'chrome',
    viewport: { width: 412, height: 915 },
    hasTouch: false
  },
  webServer: {
    command: 'node serve.mjs',
    url: 'http://localhost:4173/Daughters/',
    reuseExistingServer: true
  }
});
