import { defineConfig } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';
export default defineConfig({
  testDir: 'frontend/tests',
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'node backend/src/server.js',
        url: baseURL + '/api/health',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
      },
  workers: 1,
});
