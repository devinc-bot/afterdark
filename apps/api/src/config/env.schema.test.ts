import { expect, test } from 'vitest'
import { envSchema } from './env'
import { apiConfigSchema } from './env.schema'
import {
  RATE_LIMIT_POLICY_DEFAULTS,
  RATE_LIMIT_PROFILE,
  createRateLimitPolicy,
} from './rate-limit.policy'

const validConfig = {
  PORT: '3000',
  JWT_SECRET: 'test-jwt-secret',
  REFRESH_TOKEN_SECRET: 'test-refresh-token-secret',
  API_PUBLIC_URL: 'https://api.example.com',
  WEB_URL: 'https://example.com',
  DASHBOARD_URL: 'https://dashboard.example.com',
  ADMIN_URL: 'https://admin.example.com',
  CORS_ALLOWED_ORIGINS:
    'https://example.com,https://dashboard.example.com,https://admin.example.com',
  TRUST_PROXY_HOPS: '1',
  NODE_ENV: 'production',
}

test('accepts same-site application and API origins with a configured proxy topology', () => {
  expect(apiConfigSchema.parse(validConfig)).toMatchObject({
    TRUST_PROXY_HOPS: 1,
    ADMIN_URL: validConfig.ADMIN_URL,
    CORS_ALLOWED_ORIGINS: [validConfig.WEB_URL, validConfig.DASHBOARD_URL, validConfig.ADMIN_URL],
  })
})

test('accepts local subdomain origins during development', () => {
  expect(
    apiConfigSchema.parse({
      ...validConfig,
      API_PUBLIC_URL: 'http://localhost:3000',
      WEB_URL: 'http://web.localhost:3001',
      DASHBOARD_URL: 'http://dashboard.localhost:3002',
      ADMIN_URL: 'http://admin.localhost:3003',
      NODE_ENV: 'development',
      TRUST_PROXY_HOPS: '0',
    })
  ).toMatchObject({
    API_PUBLIC_URL: 'http://localhost:3000',
    WEB_URL: 'http://web.localhost:3001',
    DASHBOARD_URL: 'http://dashboard.localhost:3002',
    ADMIN_URL: 'http://admin.localhost:3003',
  })
})

test('retains same-site validation for local subdomain origins in production', () => {
  const result = apiConfigSchema.safeParse({
    ...validConfig,
    API_PUBLIC_URL: 'http://localhost:3000',
    WEB_URL: 'http://web.localhost:3001',
    DASHBOARD_URL: 'http://dashboard.localhost:3002',
    ADMIN_URL: 'http://admin.localhost:3003',
  })

  expect(result.success).toBe(false)
})

test('defaults CORS origins to the three application URLs and accepts extra origins', () => {
  const result = apiConfigSchema.parse({
    ...validConfig,
    CORS_ALLOWED_ORIGINS: 'https://admin.example.com, https://partner.example.com',
  })

  expect(result.CORS_ALLOWED_ORIGINS).toEqual([
    validConfig.WEB_URL,
    validConfig.DASHBOARD_URL,
    validConfig.ADMIN_URL,
    'https://partner.example.com',
  ])

  const withoutConfiguredOrigins = apiConfigSchema.parse({
    ...validConfig,
    CORS_ALLOWED_ORIGINS: undefined,
  })

  expect(withoutConfiguredOrigins.CORS_ALLOWED_ORIGINS).toEqual([
    validConfig.WEB_URL,
    validConfig.DASHBOARD_URL,
    validConfig.ADMIN_URL,
  ])
})

test('rejects a deployment whose origins do not share a schemeful site', () => {
  const result = apiConfigSchema.safeParse({
    ...validConfig,
    ADMIN_URL: 'https://admin.example.net',
  })

  expect(result.success).toBe(false)
})

test('rejects public-suffix and IP-address site mismatches', () => {
  const publicSuffixResult = apiConfigSchema.safeParse({
    ...validConfig,
    API_PUBLIC_URL: 'https://api.foo.co.uk',
    WEB_URL: 'https://bar.co.uk',
    DASHBOARD_URL: 'https://dashboard.foo.co.uk',
    ADMIN_URL: 'https://admin.foo.co.uk',
  })
  const ipAddressResult = apiConfigSchema.safeParse({
    ...validConfig,
    API_PUBLIC_URL: 'https://192.0.2.1',
    WEB_URL: 'https://192.0.2.2',
    DASHBOARD_URL: 'https://192.0.2.1',
    ADMIN_URL: 'https://192.0.2.1',
  })

  expect(publicSuffixResult.success).toBe(false)
  expect(ipAddressResult.success).toBe(false)
})

test('defaults omitted rate-limit pairs to the approved policy budgets', () => {
  expect(apiConfigSchema.parse(validConfig)).toMatchObject({
    RATE_LIMIT_PUBLIC_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.PUBLIC].limit,
    RATE_LIMIT_PUBLIC_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.PUBLIC].ttlMs,
    RATE_LIMIT_AUTHENTICATED_LIMIT:
      RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.AUTHENTICATED].limit,
    RATE_LIMIT_AUTHENTICATED_TTL_MS:
      RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.AUTHENTICATED].ttlMs,
    RATE_LIMIT_LOGIN_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.LOGIN].limit,
    RATE_LIMIT_LOGIN_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.LOGIN].ttlMs,
    RATE_LIMIT_AUTH_SENSITIVE_LIMIT:
      RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.AUTH_SENSITIVE].limit,
    RATE_LIMIT_AUTH_SENSITIVE_TTL_MS:
      RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.AUTH_SENSITIVE].ttlMs,
    RATE_LIMIT_AUTH_CONFIRM_LIMIT:
      RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.AUTH_CONFIRM].limit,
    RATE_LIMIT_AUTH_CONFIRM_TTL_MS:
      RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.AUTH_CONFIRM].ttlMs,
    RATE_LIMIT_REFRESH_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.REFRESH].limit,
    RATE_LIMIT_REFRESH_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.REFRESH].ttlMs,
    RATE_LIMIT_PURCHASE_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.PURCHASE].limit,
    RATE_LIMIT_PURCHASE_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.PURCHASE].ttlMs,
    RATE_LIMIT_QR_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.QR].limit,
    RATE_LIMIT_QR_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.QR].ttlMs,
    RATE_LIMIT_CHECK_IN_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.CHECK_IN].limit,
    RATE_LIMIT_CHECK_IN_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.CHECK_IN].ttlMs,
    RATE_LIMIT_GEO_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.GEO].limit,
    RATE_LIMIT_GEO_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.GEO].ttlMs,
    RATE_LIMIT_SSE_LIMIT: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.SSE].limit,
    RATE_LIMIT_SSE_TTL_MS: RATE_LIMIT_POLICY_DEFAULTS[RATE_LIMIT_PROFILE.SSE].ttlMs,
  })
})

test('maps omitted rate-limit env onto every named policy profile', () => {
  expect(createRateLimitPolicy(apiConfigSchema.parse(validConfig))).toEqual(
    RATE_LIMIT_POLICY_DEFAULTS
  )
})

test('accepts explicit rate-limit overrides', () => {
  const parsed = apiConfigSchema.parse({
    ...validConfig,
    RATE_LIMIT_PUBLIC_LIMIT: '80',
    RATE_LIMIT_PUBLIC_TTL_MS: '45000',
    RATE_LIMIT_AUTHENTICATED_LIMIT: '200',
    RATE_LIMIT_AUTHENTICATED_TTL_MS: '50000',
    RATE_LIMIT_LOGIN_LIMIT: '8',
    RATE_LIMIT_LOGIN_TTL_MS: '800000',
    RATE_LIMIT_AUTH_SENSITIVE_LIMIT: '3',
    RATE_LIMIT_AUTH_SENSITIVE_TTL_MS: '700000',
    RATE_LIMIT_AUTH_CONFIRM_LIMIT: '12',
    RATE_LIMIT_AUTH_CONFIRM_TTL_MS: '600000',
    RATE_LIMIT_REFRESH_LIMIT: '25',
    RATE_LIMIT_REFRESH_TTL_MS: '40000',
    RATE_LIMIT_PURCHASE_LIMIT: '7',
    RATE_LIMIT_PURCHASE_TTL_MS: '35000',
    RATE_LIMIT_QR_LIMIT: '14',
    RATE_LIMIT_QR_TTL_MS: '25000',
    RATE_LIMIT_CHECK_IN_LIMIT: '40',
    RATE_LIMIT_CHECK_IN_TTL_MS: '20000',
    RATE_LIMIT_GEO_LIMIT: '15',
    RATE_LIMIT_GEO_TTL_MS: '30000',
    RATE_LIMIT_SSE_LIMIT: '9',
    RATE_LIMIT_SSE_TTL_MS: '15000',
  })

  expect(parsed).toMatchObject({
    RATE_LIMIT_PUBLIC_LIMIT: 80,
    RATE_LIMIT_PUBLIC_TTL_MS: 45_000,
    RATE_LIMIT_AUTHENTICATED_LIMIT: 200,
    RATE_LIMIT_AUTHENTICATED_TTL_MS: 50_000,
    RATE_LIMIT_LOGIN_LIMIT: 8,
    RATE_LIMIT_LOGIN_TTL_MS: 800_000,
    RATE_LIMIT_AUTH_SENSITIVE_LIMIT: 3,
    RATE_LIMIT_AUTH_SENSITIVE_TTL_MS: 700_000,
    RATE_LIMIT_AUTH_CONFIRM_LIMIT: 12,
    RATE_LIMIT_AUTH_CONFIRM_TTL_MS: 600_000,
    RATE_LIMIT_REFRESH_LIMIT: 25,
    RATE_LIMIT_REFRESH_TTL_MS: 40_000,
    RATE_LIMIT_PURCHASE_LIMIT: 7,
    RATE_LIMIT_PURCHASE_TTL_MS: 35_000,
    RATE_LIMIT_QR_LIMIT: 14,
    RATE_LIMIT_QR_TTL_MS: 25_000,
    RATE_LIMIT_CHECK_IN_LIMIT: 40,
    RATE_LIMIT_CHECK_IN_TTL_MS: 20_000,
    RATE_LIMIT_GEO_LIMIT: 15,
    RATE_LIMIT_GEO_TTL_MS: 30_000,
    RATE_LIMIT_SSE_LIMIT: 9,
    RATE_LIMIT_SSE_TTL_MS: 15_000,
  })
  expect(createRateLimitPolicy(parsed)).toEqual({
    [RATE_LIMIT_PROFILE.PUBLIC]: { limit: 80, ttlMs: 45_000 },
    [RATE_LIMIT_PROFILE.AUTHENTICATED]: { limit: 200, ttlMs: 50_000 },
    [RATE_LIMIT_PROFILE.LOGIN]: { limit: 8, ttlMs: 800_000 },
    [RATE_LIMIT_PROFILE.AUTH_SENSITIVE]: { limit: 3, ttlMs: 700_000 },
    [RATE_LIMIT_PROFILE.AUTH_CONFIRM]: { limit: 12, ttlMs: 600_000 },
    [RATE_LIMIT_PROFILE.REFRESH]: { limit: 25, ttlMs: 40_000 },
    [RATE_LIMIT_PROFILE.PURCHASE]: { limit: 7, ttlMs: 35_000 },
    [RATE_LIMIT_PROFILE.QR]: { limit: 14, ttlMs: 25_000 },
    [RATE_LIMIT_PROFILE.CHECK_IN]: { limit: 40, ttlMs: 20_000 },
    [RATE_LIMIT_PROFILE.GEO]: { limit: 15, ttlMs: 30_000 },
    [RATE_LIMIT_PROFILE.SSE]: { limit: 9, ttlMs: 15_000 },
  })
})

test('rejects a non-positive rate-limit value', () => {
  const zeroLimit = apiConfigSchema.safeParse({ ...validConfig, RATE_LIMIT_LOGIN_LIMIT: '0' })
  const zeroTtl = apiConfigSchema.safeParse({ ...validConfig, RATE_LIMIT_PUBLIC_TTL_MS: '0' })
  const negativeLimit = apiConfigSchema.safeParse({
    ...validConfig,
    RATE_LIMIT_GEO_LIMIT: '-1',
  })
  const negativeTtl = apiConfigSchema.safeParse({
    ...validConfig,
    RATE_LIMIT_REFRESH_TTL_MS: '-1000',
  })
  const nonIntegerLimit = apiConfigSchema.safeParse({
    ...validConfig,
    RATE_LIMIT_SSE_LIMIT: '1.5',
  })

  expect(zeroLimit.success).toBe(false)
  expect(zeroTtl.success).toBe(false)
  expect(negativeLimit.success).toBe(false)
  expect(negativeTtl.success).toBe(false)
  expect(nonIntegerLimit.success).toBe(false)
})

test('rejects an invalid trusted proxy hop count', () => {
  const result = apiConfigSchema.safeParse({ ...validConfig, TRUST_PROXY_HOPS: '-1' })

  expect(result.success).toBe(false)
})

test('requires a trusted proxy hop in production', () => {
  const result = apiConfigSchema.safeParse({ ...validConfig, TRUST_PROXY_HOPS: '0' })

  expect(result.success).toBe(false)
})

test('preserves API cross-field validation in the runtime environment schema', () => {
  const result = envSchema.safeParse({
    ...process.env,
    NODE_ENV: 'production',
    TRUST_PROXY_HOPS: '0',
  })

  expect(result.success).toBe(false)
})
