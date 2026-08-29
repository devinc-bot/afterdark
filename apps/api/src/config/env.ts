import { runtimeDatabaseEnvSchema } from '@repo/db/config/env'
import { z } from 'zod'
import {
  googleOauthEnvSchema,
  mailEnvSchema,
  mercadoPagoEnvSchema,
  uploadEnvSchema,
  apiConfigSchema,
  MODE,
} from './env.schema'

const envSchema = z.object({
  ...runtimeDatabaseEnvSchema.shape,
  ...uploadEnvSchema.shape,
  ...mailEnvSchema.shape,
  ...googleOauthEnvSchema.shape,
  ...mercadoPagoEnvSchema.shape,
  ...apiConfigSchema.shape,
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
