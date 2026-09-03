export const RATE_LIMIT_PROFILE = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  LOGIN: 'login',
  AUTH_SENSITIVE: 'authSensitive',
  AUTH_CONFIRM: 'authConfirm',
  REFRESH: 'refresh',
  PURCHASE: 'purchase',
  QR: 'qr',
  CHECK_IN: 'checkIn',
  GEO: 'geo',
  SSE: 'sse',
} as const

export type RateLimitProfile = (typeof RATE_LIMIT_PROFILE)[keyof typeof RATE_LIMIT_PROFILE]

export type RateLimitBudget = {
  limit: number
  ttlMs: number
}

export const RATE_LIMIT_POLICY_DEFAULTS = {
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
} as const satisfies Record<RateLimitProfile, RateLimitBudget>

export type RateLimitPolicySource = {
  RATE_LIMIT_PUBLIC_LIMIT: number
  RATE_LIMIT_PUBLIC_TTL_MS: number
  RATE_LIMIT_AUTHENTICATED_LIMIT: number
  RATE_LIMIT_AUTHENTICATED_TTL_MS: number
  RATE_LIMIT_LOGIN_LIMIT: number
  RATE_LIMIT_LOGIN_TTL_MS: number
  RATE_LIMIT_AUTH_SENSITIVE_LIMIT: number
  RATE_LIMIT_AUTH_SENSITIVE_TTL_MS: number
  RATE_LIMIT_AUTH_CONFIRM_LIMIT: number
  RATE_LIMIT_AUTH_CONFIRM_TTL_MS: number
  RATE_LIMIT_REFRESH_LIMIT: number
  RATE_LIMIT_REFRESH_TTL_MS: number
  RATE_LIMIT_PURCHASE_LIMIT: number
  RATE_LIMIT_PURCHASE_TTL_MS: number
  RATE_LIMIT_QR_LIMIT: number
  RATE_LIMIT_QR_TTL_MS: number
  RATE_LIMIT_CHECK_IN_LIMIT: number
  RATE_LIMIT_CHECK_IN_TTL_MS: number
  RATE_LIMIT_GEO_LIMIT: number
  RATE_LIMIT_GEO_TTL_MS: number
  RATE_LIMIT_SSE_LIMIT: number
  RATE_LIMIT_SSE_TTL_MS: number
}

export type RateLimitPolicy = Record<RateLimitProfile, RateLimitBudget>

export function createRateLimitPolicy(source: RateLimitPolicySource): RateLimitPolicy {
  return {
    [RATE_LIMIT_PROFILE.PUBLIC]: {
      limit: source.RATE_LIMIT_PUBLIC_LIMIT,
      ttlMs: source.RATE_LIMIT_PUBLIC_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.AUTHENTICATED]: {
      limit: source.RATE_LIMIT_AUTHENTICATED_LIMIT,
      ttlMs: source.RATE_LIMIT_AUTHENTICATED_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.LOGIN]: {
      limit: source.RATE_LIMIT_LOGIN_LIMIT,
      ttlMs: source.RATE_LIMIT_LOGIN_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.AUTH_SENSITIVE]: {
      limit: source.RATE_LIMIT_AUTH_SENSITIVE_LIMIT,
      ttlMs: source.RATE_LIMIT_AUTH_SENSITIVE_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.AUTH_CONFIRM]: {
      limit: source.RATE_LIMIT_AUTH_CONFIRM_LIMIT,
      ttlMs: source.RATE_LIMIT_AUTH_CONFIRM_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.REFRESH]: {
      limit: source.RATE_LIMIT_REFRESH_LIMIT,
      ttlMs: source.RATE_LIMIT_REFRESH_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.PURCHASE]: {
      limit: source.RATE_LIMIT_PURCHASE_LIMIT,
      ttlMs: source.RATE_LIMIT_PURCHASE_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.QR]: {
      limit: source.RATE_LIMIT_QR_LIMIT,
      ttlMs: source.RATE_LIMIT_QR_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.CHECK_IN]: {
      limit: source.RATE_LIMIT_CHECK_IN_LIMIT,
      ttlMs: source.RATE_LIMIT_CHECK_IN_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.GEO]: {
      limit: source.RATE_LIMIT_GEO_LIMIT,
      ttlMs: source.RATE_LIMIT_GEO_TTL_MS,
    },
    [RATE_LIMIT_PROFILE.SSE]: {
      limit: source.RATE_LIMIT_SSE_LIMIT,
      ttlMs: source.RATE_LIMIT_SSE_TTL_MS,
    },
  }
}
