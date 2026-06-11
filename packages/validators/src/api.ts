import { z } from 'zod'

export const DEFAULT_API_URL = 'http://localhost:3000'

export const clientApiEnvSchema = z.object({
  VITE_API_URL: z.url().default(DEFAULT_API_URL),
})

export type ClientApiEnv = z.infer<typeof clientApiEnvSchema>
