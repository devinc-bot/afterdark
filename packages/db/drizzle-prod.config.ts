import type { Config } from 'drizzle-kit'
import { serverEnv } from './src/config/env.server.ts'

if (!serverEnv.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is required for the production database')
}

export default {
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: serverEnv.TURSO_DATABASE_URL,
    authToken: serverEnv.TURSO_AUTH_TOKEN,
  },
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config
