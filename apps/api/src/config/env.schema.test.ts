import { expect, test } from 'vitest'
import { envSchema } from './env'
import { apiConfigSchema } from './env.schema'

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
