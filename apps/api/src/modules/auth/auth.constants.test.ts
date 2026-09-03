import { CLIENT_APP } from '@repo/types'
import { expect, test } from 'vitest'
import {
  ACCESS_TOKEN_TTL,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  REFRESH_COOKIE_SAME_SITE,
  REFRESH_SESSION_TTL_DAYS,
} from './auth.constants'

test('defines the access and refresh token lifetimes', () => {
  expect(ACCESS_TOKEN_TTL).toBe('15m')
  expect(REFRESH_SESSION_TTL_DAYS).toBe(30)
  expect(REFRESH_COOKIE_MAX_AGE_MS).toBe(30 * 24 * 60 * 60 * 1000)
})

test('defines app-specific host-only refresh cookies', () => {
  expect(REFRESH_COOKIE_NAME).toEqual({
    web: 'app.web.auth.refresh',
    dashboard: 'app.dashboard.auth.refresh',
    admin: 'app.admin.auth.refresh',
  })
  expect(Object.keys(REFRESH_COOKIE_NAME)).toEqual(Object.values(CLIENT_APP))
  expect(REFRESH_COOKIE_PATH).toBe('/api/auth')
  expect(REFRESH_COOKIE_SAME_SITE).toBe('lax')
})
