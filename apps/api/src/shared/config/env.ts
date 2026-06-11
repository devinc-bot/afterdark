import { databaseEnvSchema, MODE } from '@afterdark/validators'
import { z } from 'zod'

const envSchema = databaseEnvSchema.extend({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().default('afterdark-dev-secret'),
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
