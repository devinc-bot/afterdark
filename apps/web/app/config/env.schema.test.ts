import { expect, test } from 'vitest'
import { webEnvSchema } from './env.schema'

const validWebEnv = {
  VITE_API_URL: 'https://api.example.com',
  VITE_DASHBOARD_URL: 'https://dashboard.example.com',
  VITE_SUPPORT_EMAIL: 'support@example.com',
}

test('web env accepts a valid VITE_SUPPORT_EMAIL with required URL fields', () => {
  expect(webEnvSchema.parse(validWebEnv)).toMatchObject({
    VITE_API_URL: validWebEnv.VITE_API_URL,
    VITE_DASHBOARD_URL: validWebEnv.VITE_DASHBOARD_URL,
    VITE_SUPPORT_EMAIL: validWebEnv.VITE_SUPPORT_EMAIL,
  })
})

test('web env rejects a missing VITE_SUPPORT_EMAIL', () => {
  const { VITE_SUPPORT_EMAIL: _omitted, ...withoutSupportEmail } = validWebEnv

  expect(webEnvSchema.safeParse(withoutSupportEmail).success).toBe(false)
})

test('web env rejects an empty VITE_SUPPORT_EMAIL', () => {
  expect(
    webEnvSchema.safeParse({
      ...validWebEnv,
      VITE_SUPPORT_EMAIL: '',
    }).success
  ).toBe(false)
})

test('web env rejects an invalid VITE_SUPPORT_EMAIL', () => {
  expect(
    webEnvSchema.safeParse({
      ...validWebEnv,
      VITE_SUPPORT_EMAIL: 'not-an-email',
    }).success
  ).toBe(false)
})
