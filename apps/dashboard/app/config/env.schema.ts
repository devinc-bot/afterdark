import { clientApiEnvSchema } from '@repo/validators'
import { z } from 'zod'

export const dashboardEnvSchema = clientApiEnvSchema.extend({
  VITE_SUPPORT_EMAIL: z.email(),
})
