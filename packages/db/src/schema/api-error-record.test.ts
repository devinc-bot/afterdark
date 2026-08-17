import assert from 'node:assert/strict'
import test from 'node:test'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import {
  API_ERROR_RECORD_FIELD_LIMITS,
  apiErrorRecords,
  type ApiErrorRecordInsert,
  type ApiErrorRecordSelect,
} from './api-error-record.ts'

test('defines bounded API error diagnostics and lookup indexes', () => {
  const config = getTableConfig(apiErrorRecords)

  assert.equal(config.name, 'api_error_records')
  assert.deepEqual(
    {
      method: apiErrorRecords.method.getSQLType(),
      path: apiErrorRecords.path.getSQLType(),
      errorName: apiErrorRecords.errorName.getSQLType(),
      message: apiErrorRecords.message.getSQLType(),
      stack: apiErrorRecords.stack.getSQLType(),
      correlationId: apiErrorRecords.correlationId.getSQLType(),
      fingerprint: apiErrorRecords.fingerprint.getSQLType(),
    },
    Object.fromEntries(
      Object.entries(API_ERROR_RECORD_FIELD_LIMITS).map(([field, limit]) => [
        field,
        `text(${limit})`,
      ])
    )
  )
  assert.equal(apiErrorRecords.stack.notNull, false)
  assert.equal(apiErrorRecords.correlationId.notNull, false)
  assert.equal(apiErrorRecords.fingerprint.notNull, true)
  assert.deepEqual(
    config.indexes.map(({ config: indexConfig }) => ({
      name: indexConfig.name,
      columns: indexConfig.columns,
    })),
    [
      { name: 'api_error_records_created_at_idx', columns: [apiErrorRecords.createdAt] },
      {
        name: 'api_error_records_fingerprint_created_at_idx',
        columns: [apiErrorRecords.fingerprint, apiErrorRecords.createdAt],
      },
    ]
  )
})

test('infers insert and select types for API error records', () => {
  const insert = {
    method: 'GET',
    path: '/api/events',
    statusCode: 500,
    errorName: 'Error',
    message: 'Unexpected failure',
  } satisfies ApiErrorRecordInsert
  const selected = {
    ...insert,
    id: 1,
    documentId: 'error-record-id',
    stack: null,
    correlationId: null,
    fingerprint: 'a'.repeat(API_ERROR_RECORD_FIELD_LIMITS.fingerprint),
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies ApiErrorRecordSelect

  assert.equal(selected.statusCode, 500)
})
