import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseEnvSchema } from './env.ts'

const localEnvPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../.env')

if (existsSync(localEnvPath)) {
  process.loadEnvFile(localEnvPath)
}

const result = databaseEnvSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${result.error.message}`)
}

export const serverEnv = result.data
