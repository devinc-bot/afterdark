import { clientApiEnvSchema } from '@repo/validators'
import { z } from 'zod'

const webEnvSchema = clientApiEnvSchema.extend({
  VITE_DASHBOARD_URL: z.url(),
})

const envResult = webEnvSchema.safeParse(import.meta.env)

if (!envResult.success) {
  throw new Error('Error validating client environment variables', { cause: envResult.error })
}

export const clientEnv = envResult.data
