import { defineConfig, devices } from '@playwright/test'

const publicEnvironment = {
  VITE_API_URL: 'http://127.0.0.1:3000',
  VITE_DASHBOARD_URL: 'http://127.0.0.1:3002',
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web',
      testMatch: /web\.spec\.ts/,
      use: { baseURL: 'http://127.0.0.1:3001' },
    },
    {
      name: 'dashboard',
      testMatch: /dashboard\.spec\.ts/,
      use: { baseURL: 'http://127.0.0.1:3002' },
    },
    {
      name: 'admin',
      testMatch: /admin\.spec\.ts/,
      use: { baseURL: 'http://127.0.0.1:3003' },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @repo/web exec vite dev --host 127.0.0.1',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: publicEnvironment,
    },
    {
      command: 'pnpm --filter @repo/dashboard exec vite dev --host 127.0.0.1',
      url: 'http://127.0.0.1:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: publicEnvironment,
    },
    {
      command: 'pnpm --filter @repo/admin exec vite dev --host 127.0.0.1',
      url: 'http://127.0.0.1:3003',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: publicEnvironment,
    },
  ],
})
