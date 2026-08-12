import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

test('returns only the buyer orders in deterministic newest-first pages', async () => {
  const { db, findOrdersPaginatedByUserDocumentId } = await dbModulePromise

  await db.run(sql`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      starts_at INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE tickets (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      event_id INTEGER
    )
  `)
  await db.run(sql`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      ticket_id INTEGER NOT NULL,
      status TEXT,
      amount REAL NOT NULL,
      quantity INTEGER NOT NULL,
      provider TEXT NOT NULL,
      paid_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  await db.run(sql`
    INSERT INTO users (id, document_id)
    VALUES (1, 'buyer-a'), (2, 'buyer-b')
  `)
  await db.run(sql`
    INSERT INTO events (id, document_id, name, starts_at)
    VALUES (1, 'event-1', 'After party', 1000)
  `)
  await db.run(sql`
    INSERT INTO tickets (id, document_id, name, type, event_id)
    VALUES
      (1, 'ticket-1', 'General', 'general', 1),
      (2, 'ticket-2', 'VIP', 'vip', NULL)
  `)
  await db.run(sql`
    INSERT INTO orders (
      id, document_id, user_id, ticket_id, status, amount, quantity, provider, created_at, updated_at
    )
    VALUES
      (1, 'order-oldest', 1, 1, 'completed', 1200, 1, 'mercado_pago', 100, 100),
      (2, 'order-same-time', 1, 2, 'pending', 2400, 2, 'mercado_pago', 200, 200),
      (3, 'order-newest', 1, 1, 'rejected', 1800, 1, 'mercado_pago', 200, 200),
      (4, 'other-user-order', 2, 1, 'completed', 1800, 1, 'mercado_pago', 300, 300)
  `)

  const firstPage = await findOrdersPaginatedByUserDocumentId({
    userDocumentId: 'buyer-a',
    page: 1,
    limit: 2,
  })
  const secondPage = await findOrdersPaginatedByUserDocumentId({
    userDocumentId: 'buyer-a',
    page: 2,
    limit: 2,
  })

  assert.equal(firstPage.total, 3)
  assert.deepEqual(
    firstPage.rows.map((order) => order.documentId),
    ['order-newest', 'order-same-time']
  )
  assert.deepEqual(firstPage.rows[1], {
    documentId: 'order-same-time',
    status: 'pending',
    amount: 2400,
    quantity: 2,
    provider: 'mercado_pago',
    paidAt: null,
    createdAt: new Date(200000),
    updatedAt: new Date(200000),
    ticketId: 'ticket-2',
    ticketName: 'VIP',
    ticketType: 'vip',
    eventId: null,
    eventName: null,
    eventStartsAt: null,
  })
  assert.deepEqual(
    secondPage.rows.map((order) => order.documentId),
    ['order-oldest']
  )
})
