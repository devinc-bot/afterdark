import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema/index.ts'
import { serverEnv } from './config/env.server.ts'

const client = createClient({
  url: serverEnv.TURSO_DATABASE_URL,
  authToken: serverEnv.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
