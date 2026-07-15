import { z } from 'zod'

export const seedEnvSchema = z.object({
  SEED_OWNER_EMAIL: z.email().default('test3@gmail.com'),
  SEED_OWNER_PASSWORD: z.string().min(8).default('Password123@'),
  SEED_OWNER_DOCUMENT_ID: z.string().min(1).default('seed-owner-test3'),
  SEED_ACCOUNT_DOCUMENT_ID: z.string().min(1).default('seed-account-test3'),
  SEED_BUYER_EMAIL: z.email().default('buyer@gmail.com'),
  SEED_BUYER_PASSWORD: z.string().min(8).default('Password123@'),
  SEED_BUYER_DOCUMENT_ID: z.string().min(1).default('seed-buyer-1'),
  SEED_BUYER_ACCOUNT_DOCUMENT_ID: z.string().min(1).default('seed-account-buyer-1'),
  SEED_BUYER_NAME: z.string().min(1).default('Comprador'),
  SEED_BUYER_LAST_NAME: z.string().min(1).default('Test'),
  SEED_BUYER_PHONE: z.string().min(1).default('1140000001'),
})

export type SeedEnv = z.infer<typeof seedEnvSchema>
