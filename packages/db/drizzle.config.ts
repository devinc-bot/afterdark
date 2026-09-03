import type { Config } from 'drizzle-kit'
import { loadMigrationEnv } from './src/config/env.loader.ts'

const migrationEnv = loadMigrationEnv()

export default {
  schema: './src/schema/index.ts',
  out: './src/migrations-postgresql',
  dialect: 'postgresql',
  dbCredentials: {
    url: migrationEnv.DATABASE_MIGRATION_URL,
  },
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
