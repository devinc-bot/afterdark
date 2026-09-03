import { webEnvSchema } from './env.schema'

const envResult = webEnvSchema.safeParse(import.meta.env)

if (!envResult.success) {
  throw new Error('Error validating client environment variables', { cause: envResult.error })
}

export const clientEnv = envResult.data
