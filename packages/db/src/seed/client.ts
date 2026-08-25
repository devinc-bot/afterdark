import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { serverEnv } from '../config/env.server.ts'
import * as schema from '../schema/index.ts'

export const seedPool = new Pool({
  connectionString: serverEnv.DATABASE_MIGRATION_URL,
  max: 1,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export const seedDb = drizzle(seedPool, { schema })
