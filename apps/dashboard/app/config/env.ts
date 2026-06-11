import { clientApiEnvSchema } from '@afterdark/validators'
import { z } from 'zod'

const envResult = clientApiEnvSchema.safeParse(import.meta.env)

if (!envResult.success) {
  console.error(z.flattenError(envResult.error).fieldErrors)
  throw new Error('Error validating client environment variables', { cause: envResult.error })
}

export const clientEnv = envResult.data
