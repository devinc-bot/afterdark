import type { Config } from 'drizzle-kit'
import { MODE } from '@afterdark/validators/database'
import { serverEnv } from './src/config/env.server.ts'

type DrizzleDbCredentials = { url: string; authToken: string | undefined } | { url: string }

type DrizzleDialect = 'turso' | 'sqlite'

function getDialect(isProduction: boolean): DrizzleDialect {
  return isProduction ? 'turso' : 'sqlite'
}

function getDbCredentials(isProduction: boolean): DrizzleDbCredentials {
  if (isProduction) {
    return {
      url: serverEnv.TURSO_DATABASE_URL,
      authToken: serverEnv.TURSO_AUTH_TOKEN,
    }
  }

  return {
    url: serverEnv.TURSO_DATABASE_URL,
  }
}

const isProduction = serverEnv.NODE_ENV === MODE.PRODUCTION

export default {
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: getDialect(isProduction),
  dbCredentials: getDbCredentials(isProduction),
} satisfies Config
