import { expect, test } from 'vitest'
import {
  RATE_LIMIT_POLICY_DEFAULTS,
  RATE_LIMIT_PROFILE,
  createRateLimitPolicy,
} from './rate-limit.policy'

test('maps validated env pairs onto every named rate-limit profile', () => {
  expect(
    createRateLimitPolicy({
      RATE_LIMIT_PUBLIC_LIMIT: 1,
      RATE_LIMIT_PUBLIC_TTL_MS: 2,
      RATE_LIMIT_AUTHENTICATED_LIMIT: 3,
      RATE_LIMIT_AUTHENTICATED_TTL_MS: 4,
      RATE_LIMIT_LOGIN_LIMIT: 5,
      RATE_LIMIT_LOGIN_TTL_MS: 6,
      RATE_LIMIT_AUTH_SENSITIVE_LIMIT: 7,
      RATE_LIMIT_AUTH_SENSITIVE_TTL_MS: 8,
      RATE_LIMIT_AUTH_CONFIRM_LIMIT: 9,
      RATE_LIMIT_AUTH_CONFIRM_TTL_MS: 10,
      RATE_LIMIT_REFRESH_LIMIT: 11,
      RATE_LIMIT_REFRESH_TTL_MS: 12,
      RATE_LIMIT_PURCHASE_LIMIT: 13,
      RATE_LIMIT_PURCHASE_TTL_MS: 14,
      RATE_LIMIT_QR_LIMIT: 15,
      RATE_LIMIT_QR_TTL_MS: 16,
      RATE_LIMIT_CHECK_IN_LIMIT: 17,
      RATE_LIMIT_CHECK_IN_TTL_MS: 18,
      RATE_LIMIT_GEO_LIMIT: 19,
      RATE_LIMIT_GEO_TTL_MS: 20,
      RATE_LIMIT_SSE_LIMIT: 21,
      RATE_LIMIT_SSE_TTL_MS: 22,
    })
  ).toEqual({
    [RATE_LIMIT_PROFILE.PUBLIC]: { limit: 1, ttlMs: 2 },
    [RATE_LIMIT_PROFILE.AUTHENTICATED]: { limit: 3, ttlMs: 4 },
    [RATE_LIMIT_PROFILE.LOGIN]: { limit: 5, ttlMs: 6 },
    [RATE_LIMIT_PROFILE.AUTH_SENSITIVE]: { limit: 7, ttlMs: 8 },
    [RATE_LIMIT_PROFILE.AUTH_CONFIRM]: { limit: 9, ttlMs: 10 },
    [RATE_LIMIT_PROFILE.REFRESH]: { limit: 11, ttlMs: 12 },
    [RATE_LIMIT_PROFILE.PURCHASE]: { limit: 13, ttlMs: 14 },
    [RATE_LIMIT_PROFILE.QR]: { limit: 15, ttlMs: 16 },
    [RATE_LIMIT_PROFILE.CHECK_IN]: { limit: 17, ttlMs: 18 },
    [RATE_LIMIT_PROFILE.GEO]: { limit: 19, ttlMs: 20 },
    [RATE_LIMIT_PROFILE.SSE]: { limit: 21, ttlMs: 22 },
  })
})

test('locks the approved default budget for every named rate-limit profile', () => {
  expect(RATE_LIMIT_POLICY_DEFAULTS).toEqual({
    [RATE_LIMIT_PROFILE.PUBLIC]: { limit: 120, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.AUTHENTICATED]: { limit: 240, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.LOGIN]: { limit: 10, ttlMs: 900_000 },
    [RATE_LIMIT_PROFILE.AUTH_SENSITIVE]: { limit: 5, ttlMs: 900_000 },
    [RATE_LIMIT_PROFILE.AUTH_CONFIRM]: { limit: 20, ttlMs: 900_000 },
    [RATE_LIMIT_PROFILE.REFRESH]: { limit: 30, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.PURCHASE]: { limit: 10, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.QR]: { limit: 20, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.CHECK_IN]: { limit: 60, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.GEO]: { limit: 30, ttlMs: 60_000 },
    [RATE_LIMIT_PROFILE.SSE]: { limit: 20, ttlMs: 60_000 },
  })
})
