import { IMAGE_OPTIMIZATION, IMAGE_UPLOAD_MAX_BYTES } from '@repo/validators'
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

export const apiConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  API_PUBLIC_URL: z.url(),
  DASHBOARD_URL: z.url(),
  WEB_URL: z.url(),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  NODE_ENV: z.enum([MODE.DEVELOPMENT, MODE.PRODUCTION, MODE.TEST]).default(MODE.DEVELOPMENT),
})
