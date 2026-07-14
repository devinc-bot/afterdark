import { z } from 'zod'

export const googleOauthEnvSchema = z.object({
  API_PUBLIC_URL: z.url().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
})
