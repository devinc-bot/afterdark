import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const API_ERROR_RECORD_FIELD_LIMITS = {
  method: 16,
  path: 2048,
  errorName: 128,
  message: 4096,
  stack: 16384,
  correlationId: 128,
  fingerprint: 64,
} as const

export const apiErrorRecords = sqliteTable(
  'api_error_records',
  {
    ...createBaseColumns('api_error_records'),
    method: text('method', { length: API_ERROR_RECORD_FIELD_LIMITS.method }).notNull(),
    path: text('path', { length: API_ERROR_RECORD_FIELD_LIMITS.path }).notNull(),
    statusCode: integer('status_code').notNull(),
    errorName: text('error_name', {
      length: API_ERROR_RECORD_FIELD_LIMITS.errorName,
    }).notNull(),
    message: text('message', { length: API_ERROR_RECORD_FIELD_LIMITS.message }).notNull(),
    stack: text('stack', { length: API_ERROR_RECORD_FIELD_LIMITS.stack }),
    correlationId: text('correlation_id', {
      length: API_ERROR_RECORD_FIELD_LIMITS.correlationId,
    }),
    fingerprint: text('fingerprint', { length: API_ERROR_RECORD_FIELD_LIMITS.fingerprint })
      .notNull()
      .default('legacy'),
  },
  (table) => [
    index('api_error_records_created_at_idx').on(table.createdAt),
    index('api_error_records_fingerprint_created_at_idx').on(table.fingerprint, table.createdAt),
  ]
)

export type ApiErrorRecordSelect = typeof apiErrorRecords.$inferSelect
export type ApiErrorRecordInsert = typeof apiErrorRecords.$inferInsert
