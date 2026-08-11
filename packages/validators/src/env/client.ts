import { z } from 'zod'

export const clientApiEnvSchema = z.object({
  VITE_API_URL: z.url(),
})

export type ClientApiEnv = z.infer<typeof clientApiEnvSchema>
