import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

test('deletes only pending orders created before the cutoff', async () => {
  const { db, deleteStalePendingOrders, orders } = await dbModulePromise
  const cutoff = new Date(2026, 7, 1)
  const cutoffTimestamp = Math.floor(cutoff.getTime() / 1000)

  await db.run(sql`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      status TEXT,
      created_at INTEGER
    )
  `)
  await db.run(sql`
    INSERT INTO orders (id, status, created_at)
    VALUES
      (1, 'pending', ${cutoffTimestamp - 1}),
      (2, 'pending', ${cutoffTimestamp}),
      (3, 'completed', ${cutoffTimestamp - 1})
  `)

  assert.equal(await deleteStalePendingOrders(cutoff), 1)

  const remaining = await db.select({ id: orders.id }).from(orders).orderBy(orders.id)

  assert.deepEqual(
    remaining.map(({ id }) => id),
    [2, 3]
  )
})
