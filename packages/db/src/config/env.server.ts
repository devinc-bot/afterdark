import { databaseEnvSchema } from '@repo/validators/database'

const result = databaseEnvSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${result.error.message}`)
}

export const serverEnv = result.data
