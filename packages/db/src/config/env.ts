import { z } from 'zod'

export const databaseEnvSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_MIGRATION_URL: z.url(),
})

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>
