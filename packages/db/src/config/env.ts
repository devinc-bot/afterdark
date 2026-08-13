import { z } from 'zod'

export const databaseEnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().default('file:../../local.db'),
  TURSO_AUTH_TOKEN: z.string().optional(),
})

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>
