import { z } from 'zod'

export const DEFAULT_API_URL = 'http://localhost:3000'
export const DEFAULT_DASHBOARD_URL = 'http://localhost:3002'

export const clientApiEnvSchema = z.object({
  VITE_API_URL: z.url().default(DEFAULT_API_URL),
  VITE_DASHBOARD_URL: z.url().default(DEFAULT_DASHBOARD_URL),
})

export type ClientApiEnv = z.infer<typeof clientApiEnvSchema>
