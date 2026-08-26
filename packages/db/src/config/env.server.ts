import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseEnvSchema } from './env.ts'

process.loadEnvFile(resolve(fileURLToPath(new URL('.', import.meta.url)), '../../.env'))

const result = databaseEnvSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${result.error.message}`)
}

export const serverEnv = result.data
