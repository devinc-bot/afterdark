import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema/index.ts'
import { serverEnv } from './config/env.server.ts'

export const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export const db = drizzle(pool, { schema })

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
