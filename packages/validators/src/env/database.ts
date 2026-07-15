import { z } from 'zod'

export const MODE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const

export const databaseEnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().default('file:../../local.db'),
  TURSO_AUTH_TOKEN: z.string().optional(),
  NODE_ENV: z.enum([MODE.DEVELOPMENT, MODE.PRODUCTION, MODE.TEST]).default(MODE.DEVELOPMENT),
})

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>
