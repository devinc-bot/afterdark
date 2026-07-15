import { z } from 'zod'

/** Optional at boot — MailService validates on send. */
export const mailEnvSchema = z.object({
  RESEND_API_KEY: z.string().default(''),
  MAIL_FROM: z.string().default(''),
  MAIL_SMOKE_TO: z.string().default(''),
})
