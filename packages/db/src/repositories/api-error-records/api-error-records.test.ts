import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

test('inserts sanitized error fields and deletes only records before the cutoff', async () => {
  const { apiErrorRecords, createApiErrorRecord, db, deleteApiErrorRecordsBefore } =
    await dbModulePromise
  const cutoff = new Date(2026, 7, 1)
  const cutoffTimestamp = Math.floor(cutoff.getTime() / 1000)

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

  const created = await createApiErrorRecord({
    method: 'POST',
    path: '/api/events',
    statusCode: 503,
    errorName: 'UpstreamError',
    message: 'Service unavailable',
    stack: 'UpstreamError: Service unavailable',
    correlationId: 'request-123',
  })

  assert.equal(created.statusCode, 503)
  assert.equal(created.correlationId, 'request-123')

  await db.run(sql`
    INSERT INTO api_error_records (
      document_id, created_at, updated_at, method, path, status_code, error_name, message
    ) VALUES
      ('old-record', ${cutoffTimestamp - 1}, ${cutoffTimestamp - 1}, 'GET', '/old', 500, 'Error', 'old'),
      ('cutoff-record', ${cutoffTimestamp}, ${cutoffTimestamp}, 'GET', '/cutoff', 500, 'Error', 'cutoff')
  `)

  assert.equal(await deleteApiErrorRecordsBefore(cutoff), 1)

  const records = await db
    .select({ documentId: apiErrorRecords.documentId })
    .from(apiErrorRecords)
    .orderBy(apiErrorRecords.documentId)

  assert.deepEqual(
    records.map(({ documentId }) => documentId),
    [created.documentId, 'cutoff-record'].sort()
  )
})

test('suppresses only matching fingerprints inside the supplied window', async () => {
  const { apiErrorRecords, createApiErrorRecordUnlessRecent, db } = await dbModulePromise
  const cutoff = new Date(2026, 7, 1)
  const cutoffTimestamp = Math.floor(cutoff.getTime() / 1000)
  const input = {
    method: 'GET',
    path: '/api/events',
    statusCode: 500,
    errorName: 'Error',
    message: 'Unexpected failure',
    stack: 'Error: Unexpected failure',
    correlationId: null,
    fingerprint: 'a'.repeat(64),
  }

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
      document_id, created_at, updated_at, method, path, status_code, error_name, message, stack, fingerprint
    ) VALUES
      ('recent-duplicate', ${cutoffTimestamp}, ${cutoffTimestamp}, 'GET', '/api/events', 500, 'Error', 'Unexpected failure', 'Error: Unexpected failure', ${input.fingerprint}),
      ('expired-duplicate', ${cutoffTimestamp - 1}, ${cutoffTimestamp - 1}, 'GET', '/api/events', 500, 'Error', 'Unexpected failure', 'Error: Unexpected failure', ${'b'.repeat(64)})
  `)

  assert.equal(await createApiErrorRecordUnlessRecent(input, cutoff), null)
  assert.ok(
    await createApiErrorRecordUnlessRecent({ ...input, fingerprint: 'b'.repeat(64) }, cutoff)
  )
  assert.ok(
    await createApiErrorRecordUnlessRecent({ ...input, fingerprint: 'c'.repeat(64) }, cutoff)
  )

  const records = await db
    .select({ fingerprint: apiErrorRecords.fingerprint })
    .from(apiErrorRecords)
  assert.equal(records.length, 4)
})
