import { clientApiEnvSchema } from '@repo/validators'
import { z } from 'zod'

export const webEnvSchema = clientApiEnvSchema.extend({
  VITE_DASHBOARD_URL: z.url(),
})
