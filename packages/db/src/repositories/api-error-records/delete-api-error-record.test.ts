import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

test('deletes only the API error record matching the document id', async () => {
  const { apiErrorRecords, db, deleteApiErrorRecordByDocumentId } = await dbModulePromise

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
      ('rec-1', 100, 100, 'GET', '/api/events', 500, 'Error', 'boom'),
      ('rec-2', 200, 200, 'POST', '/api/orders', 503, 'Upstream', 'down')
  `)

  assert.equal(await deleteApiErrorRecordByDocumentId('rec-1'), true)
  assert.equal(await deleteApiErrorRecordByDocumentId('missing'), false)

  const remaining = await db
    .select({ documentId: apiErrorRecords.documentId })
    .from(apiErrorRecords)

  assert.deepEqual(remaining, [{ documentId: 'rec-2' }])
})
