import { runtimeDatabaseEnvSchema } from '@repo/db/config/env'
import { z } from 'zod'
import {
  googleOauthEnvSchema,
  mailEnvSchema,
  mercadoPagoEnvSchema,
  uploadEnvSchema,
  MODE,
  apiConfigSchema,
} from './env.schema'
import { createRateLimitPolicy } from './rate-limit.policy'

export const envSchema = z
  .object({
    ...runtimeDatabaseEnvSchema.shape,
    ...uploadEnvSchema.shape,
    ...mailEnvSchema.shape,
    ...googleOauthEnvSchema.shape,
    ...mercadoPagoEnvSchema.shape,
  })
  .and(apiConfigSchema)

type Env = z.infer<typeof envSchema>

let envResult: Env

try {
  envResult = envSchema.parse(process.env)
} catch (error) {
  throw new Error(`Error validating environment variables: ${error}`, { cause: error })
}

export const RATE_LIMIT_POLICY = createRateLimitPolicy(envResult)

export const ENV = {
  ...envResult,
  isDevelopment: envResult.NODE_ENV === MODE.DEVELOPMENT,
  isProduction: envResult.NODE_ENV === MODE.PRODUCTION,
} as const
