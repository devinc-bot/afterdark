import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

test('deletes only the pending order owned by the buyer', async () => {
  const { db, deletePendingOrderByDocumentIdAndUserId, orders } = await dbModulePromise

  await db.run(sql`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT
    )
  `)
  await db.run(sql`
    INSERT INTO orders (id, document_id, user_id, status)
    VALUES
      (1, 'owned-pending', 1, 'pending'),
      (2, 'owned-completed', 1, 'completed'),
      (3, 'owned-rejected', 1, 'rejected'),
      (4, 'owned-cancelled', 1, 'cancelled'),
      (5, 'other-pending', 2, 'pending'),
      (6, 'owned-null-status', 1, NULL)
  `)

  assert.equal(await deletePendingOrderByDocumentIdAndUserId('owned-pending', 1), true)
  assert.equal(await deletePendingOrderByDocumentIdAndUserId('owned-completed', 1), false)
  assert.equal(await deletePendingOrderByDocumentIdAndUserId('owned-rejected', 1), false)
  assert.equal(await deletePendingOrderByDocumentIdAndUserId('owned-cancelled', 1), false)
  assert.equal(await deletePendingOrderByDocumentIdAndUserId('other-pending', 1), false)
  assert.equal(await deletePendingOrderByDocumentIdAndUserId('missing-order', 1), false)
  assert.equal(await deletePendingOrderByDocumentIdAndUserId('owned-null-status', 1), false)

  const remaining = await db
    .select({ documentId: orders.documentId })
    .from(orders)
    .orderBy(orders.id)

  assert.deepEqual(
    remaining.map((order) => order.documentId),
    ['owned-completed', 'owned-rejected', 'owned-cancelled', 'other-pending', 'owned-null-status']
  )
})
