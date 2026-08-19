import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

const second = (value: number) => new Date(value * 1000)

test('lists records newest-first with deterministic pagination', async () => {
  const { db, findApiErrorRecordsPaginated } = await dbModulePromise

  await db.run(sql`
    CREATE TABLE api_error_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      error_name TEXT NOT NULL,
      message TEXT NOT NULL,
      stack TEXT,
      correlation_id TEXT,
      fingerprint TEXT NOT NULL DEFAULT 'legacy'
    )
  `)

  await db.run(sql`
    INSERT INTO api_error_records (
      document_id, created_at, updated_at, method, path, status_code, error_name, message
    ) VALUES
      ('oldest', 100, 100, 'GET', '/api/events', 500, 'Error', 'boom'),
      ('same-time-b', 200, 200, 'POST', '/api/orders', 503, 'Upstream', 'down'),
      ('same-time-a', 200, 200, 'GET', '/api/events', 500, 'Error', 'boom'),
      ('newest', 300, 300, 'DELETE', '/api/events/1', 502, 'BadGateway', 'gateway')
  `)

  const firstPage = await findApiErrorRecordsPaginated({ page: 1, limit: 2 })
  const secondPage = await findApiErrorRecordsPaginated({ page: 2, limit: 2 })

  assert.equal(firstPage.total, 4)
  assert.deepEqual(
    firstPage.rows.map((row) => row.documentId),
    ['newest', 'same-time-a']
  )
  assert.deepEqual(
    secondPage.rows.map((row) => row.documentId),
    ['same-time-b', 'oldest']
  )
})

test('filters by status code, path substring, and date range', async () => {
  const { db, findApiErrorRecordsPaginated } = await dbModulePromise

  await db.run(sql`DROP TABLE api_error_records`)
  await db.run(sql`
    CREATE TABLE api_error_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      error_name TEXT NOT NULL,
      message TEXT NOT NULL,
      stack TEXT,
      correlation_id TEXT,
      fingerprint TEXT NOT NULL DEFAULT 'legacy'
    )
  `)

  await db.run(sql`
    INSERT INTO api_error_records (
      document_id, created_at, updated_at, method, path, status_code, error_name, message
    ) VALUES
      ('e500-events', 100, 100, 'GET', '/api/events', 500, 'Error', 'boom'),
      ('e503-events', 200, 200, 'GET', '/api/events', 503, 'Upstream', 'down'),
      ('e500-orders', 300, 300, 'POST', '/api/orders', 500, 'Error', 'boom'),
      ('e502-orders', 400, 400, 'POST', '/api/orders', 502, 'BadGateway', 'gateway')
  `)

  const byStatus = await findApiErrorRecordsPaginated({ page: 1, limit: 10, statusCode: 500 })
  assert.deepEqual(
    byStatus.rows.map((row) => row.documentId),
    ['e500-orders', 'e500-events']
  )
  assert.equal(byStatus.total, 2)

  const byPath = await findApiErrorRecordsPaginated({ page: 1, limit: 10, path: 'orders' })
  assert.deepEqual(
    byPath.rows.map((row) => row.documentId),
    ['e502-orders', 'e500-orders']
  )
  assert.equal(byPath.total, 2)

  const byRange = await findApiErrorRecordsPaginated({
    page: 1,
    limit: 10,
    from: second(150),
    to: second(350),
  })
  assert.deepEqual(
    byRange.rows.map((row) => row.documentId),
    ['e500-orders', 'e503-events']
  )
  assert.equal(byRange.total, 2)

  const combined = await findApiErrorRecordsPaginated({
    page: 1,
    limit: 10,
    statusCode: 500,
    path: 'events',
  })
  assert.deepEqual(
    combined.rows.map((row) => row.documentId),
    ['e500-events']
  )
  assert.equal(combined.total, 1)

  const noMatch = await findApiErrorRecordsPaginated({ page: 1, limit: 10, statusCode: 599 })
  assert.equal(noMatch.total, 0)
  assert.deepEqual(noMatch.rows, [])
})
