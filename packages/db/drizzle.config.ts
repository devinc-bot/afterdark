import type { Config } from 'drizzle-kit'
import { serverEnv } from './src/config/env.server.ts'

export default {
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: serverEnv.TURSO_DATABASE_URL,
    authToken: serverEnv.TURSO_AUTH_TOKEN,
  },
} satisfies Config
