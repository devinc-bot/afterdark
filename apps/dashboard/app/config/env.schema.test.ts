import { expect, test } from 'vitest'
import { dashboardEnvSchema } from './env.schema'

const validDashboardEnv = {
  VITE_API_URL: 'https://api.example.com',
  VITE_SUPPORT_EMAIL: 'support@example.com',
}

test('dashboard env accepts a valid VITE_SUPPORT_EMAIL with required API URL', () => {
  expect(dashboardEnvSchema.parse(validDashboardEnv)).toMatchObject({
    VITE_API_URL: validDashboardEnv.VITE_API_URL,
    VITE_SUPPORT_EMAIL: validDashboardEnv.VITE_SUPPORT_EMAIL,
  })
})

test('dashboard env rejects a missing VITE_SUPPORT_EMAIL', () => {
  const { VITE_SUPPORT_EMAIL: _omitted, ...withoutSupportEmail } = validDashboardEnv

  expect(dashboardEnvSchema.safeParse(withoutSupportEmail).success).toBe(false)
})

test('dashboard env rejects an empty VITE_SUPPORT_EMAIL', () => {
  expect(
    dashboardEnvSchema.safeParse({
      ...validDashboardEnv,
      VITE_SUPPORT_EMAIL: '',
    }).success
  ).toBe(false)
})

test('dashboard env rejects an invalid VITE_SUPPORT_EMAIL', () => {
  expect(
    dashboardEnvSchema.safeParse({
      ...validDashboardEnv,
      VITE_SUPPORT_EMAIL: 'not-an-email',
    }).success
  ).toBe(false)
})
