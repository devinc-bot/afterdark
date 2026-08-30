import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { loadMigrationEnv } from '../config/env.loader.ts'
import * as schema from '../schema/index.ts'

const migrationEnv = loadMigrationEnv()

export const seedPool = new Pool({
  connectionString: migrationEnv.DATABASE_MIGRATION_URL,
  max: 1,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export const seedDb = drizzle(seedPool, { schema })
