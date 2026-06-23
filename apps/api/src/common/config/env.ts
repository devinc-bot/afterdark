import { databaseEnvSchema, MODE } from '@afterdark/validators'
import { z } from 'zod'

const envSchema = databaseEnvSchema.extend({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().default('afterdark-dev-secret'),
  DASHBOARD_URL: z.url().default('http://localhost:3002'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3001,http://localhost:3002')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
})

type Env = z.infer<typeof envSchema>

let envResult: Env

try {
  envResult = envSchema.parse(process.env)
} catch (error) {
  throw new Error(`Error validating environment variables: ${error}`, { cause: error })
}

export const ENV = {
  ...envResult,
  isDevelopment: envResult.NODE_ENV === MODE.DEVELOPMENT,
  isProduction: envResult.NODE_ENV === MODE.PRODUCTION,
} as const
