import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { productionSeedEnvSchema } from '@repo/validators'

config({ path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../.env') })

const result = productionSeedEnvSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`Invalid production seed environment variables:\n${result.error.message}`)
}

export const productionSeedEnv = result.data
