import { vi } from 'vitest'

vi.mock('@repo/i18n/server', () => ({
  TranslationService: class TranslationService {},
}))

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '3000',
  JWT_SECRET: 'test-jwt-secret-do-not-use-in-production',
  API_PUBLIC_URL: 'http://localhost:3000',
  DASHBOARD_URL: 'http://localhost:3002',
  WEB_URL: 'http://localhost:3001',
  CORS_ALLOWED_ORIGINS: 'http://localhost:3001,http://localhost:3002,http://localhost:3003',
  DATABASE_URL: 'postgres://test:test@localhost:5432/test',
  DATABASE_MIGRATION_URL: 'postgres://test:test@localhost:5432/test',
  UPLOAD_MAX_BYTES: '10485760',
  IMAGE_MAX_DIMENSION: '2048',
  IMAGE_QUALITY: '82',
  R2_ACCOUNT_ID: 'test-r2-account',
  R2_ACCESS_KEY_ID: 'test-r2-access-key',
  R2_SECRET_ACCESS_KEY: 'test-r2-secret-key',
  R2_BUCKET: 'test-bucket',
  R2_PUBLIC_BASE_URL: 'http://localhost:3000/files',
  R2_UPLOAD_PREFIX: 'images',
  RESEND_API_KEY: 'test-resend-key',
  MAIL_FROM: 'no-reply@example.test',
  MAIL_SMOKE_TO: 'smoke@example.test',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  MERCADOPAGO_ACCESS_TOKEN: 'test-mercado-pago-token',
  MERCADOPAGO_WEBHOOK_SECRET: 'test-mercado-pago-secret',
  MERCADOPAGO_TEST_MODE: 'false',
})
