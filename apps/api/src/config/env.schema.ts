import { IMAGE_OPTIMIZATION, IMAGE_UPLOAD_MAX_BYTES } from '@repo/validators'
import { getDomain } from 'tldts'
import { z } from 'zod'

export const googleOauthEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
})

export const mailEnvSchema = z.object({
  RESEND_API_KEY: z.string(),
  MAIL_FROM: z.string(),
  MAIL_SMOKE_TO: z.string(),
})

export const mercadoPagoEnvSchema = z.object({
  MERCADOPAGO_ACCESS_TOKEN: z.string(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string(),
  MERCADOPAGO_TEST_MODE: z.string().transform((value) => value === 'true' || value === '1'),
})

export const uploadEnvSchema = z.object({
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(IMAGE_UPLOAD_MAX_BYTES),
  IMAGE_MAX_DIMENSION: z.coerce.number().int().positive().default(IMAGE_OPTIMIZATION.MAX_DIMENSION),
  IMAGE_QUALITY: z.coerce.number().int().min(1).max(100).default(IMAGE_OPTIMIZATION.QUALITY),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.url(),
  R2_UPLOAD_PREFIX: z.string().default('images'),
})

export const MODE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const

function getSchemefulSite(url: string): string {
  const { protocol, hostname } = new URL(url)
  // Resolve the registrable domain so api.example.com and dashboard.example.com
  // share https://example.com, while api.foo.co.uk and bar.co.uk do not share a site.
  const registrableDomain = getDomain(hostname) ?? hostname

  return `${protocol}//${registrableDomain}`
}

export const apiConfigSchema = z
  .object({
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    API_PUBLIC_URL: z.url(),
    DASHBOARD_URL: z.url(),
    WEB_URL: z.url(),
    ADMIN_URL: z.url(),
    CORS_ALLOWED_ORIGINS: z
      .string()
      .transform((value) => value.split(',').map((origin) => origin.trim())),
    // Number of trusted reverse-proxy hops before the client; use 0 for local direct access.
    TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative(),
    NODE_ENV: z.enum([MODE.DEVELOPMENT, MODE.PRODUCTION, MODE.TEST]).default(MODE.DEVELOPMENT),
  })
  .superRefine((config, context) => {
    const origins = [config.API_PUBLIC_URL, config.WEB_URL, config.DASHBOARD_URL, config.ADMIN_URL]
    const expectedSite = getSchemefulSite(config.API_PUBLIC_URL)

    if (origins.some((origin) => getSchemefulSite(origin) !== expectedSite)) {
      context.addIssue({
        code: 'custom',
        message:
          'API_PUBLIC_URL, WEB_URL, DASHBOARD_URL, and ADMIN_URL must share a schemeful site.',
      })
    }

    const requiredOrigins = [config.WEB_URL, config.DASHBOARD_URL, config.ADMIN_URL]
    if (requiredOrigins.some((origin) => !config.CORS_ALLOWED_ORIGINS.includes(origin))) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ALLOWED_ORIGINS'],
        message: 'CORS_ALLOWED_ORIGINS must include WEB_URL, DASHBOARD_URL, and ADMIN_URL.',
      })
    }

    if (config.NODE_ENV === MODE.PRODUCTION && config.TRUST_PROXY_HOPS === 0) {
      context.addIssue({
        code: 'custom',
        path: ['TRUST_PROXY_HOPS'],
        message: 'TRUST_PROXY_HOPS must be at least 1 in production.',
      })
    }
  })
