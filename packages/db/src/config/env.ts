import { z } from 'zod'

export const databaseEnvSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_MIGRATION_URL: z.url(),
})

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>

export const runtimeDatabaseEnvSchema = databaseEnvSchema.pick({
  DATABASE_URL: true,
})

export type RuntimeDatabaseEnv = z.infer<typeof runtimeDatabaseEnvSchema>

export const migrationEnvSchema = databaseEnvSchema.pick({
  DATABASE_MIGRATION_URL: true,
})

export type MigrationEnv = z.infer<typeof migrationEnvSchema>
