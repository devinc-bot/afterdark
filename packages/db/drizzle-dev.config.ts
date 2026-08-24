import type { Config } from 'drizzle-kit'
import { serverEnv } from './src/config/env.server.ts'

export default {
  schema: './src/schema/index.ts',
  out: './src/migrations-postgresql',
  dialect: 'postgresql',
  dbCredentials: {
    url: serverEnv.DATABASE_MIGRATION_URL,
  },
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
