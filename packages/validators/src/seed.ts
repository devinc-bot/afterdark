import { z } from 'zod'

export const seedEnvSchema = z.object({
  SEED_ADMIN_EMAIL: z.email(),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_OWNER_EMAIL: z.email(),
  SEED_OWNER_PASSWORD: z.string().min(8),
  SEED_OWNER_DOCUMENT_ID: z.string().min(1),
  SEED_ACCOUNT_DOCUMENT_ID: z.string().min(1),
  SEED_BUYER_EMAIL: z.email(),
  SEED_BUYER_PASSWORD: z.string().min(8),
  SEED_BUYER_DOCUMENT_ID: z.string().min(1),
  SEED_BUYER_ACCOUNT_DOCUMENT_ID: z.string().min(1),
  SEED_BUYER_NAME: z.string().min(1),
  SEED_BUYER_LAST_NAME: z.string().min(1),
  SEED_BUYER_PHONE: z.string().min(1),
})

export type SeedEnv = z.infer<typeof seedEnvSchema>
