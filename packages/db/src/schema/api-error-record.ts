import { index, integer, pgTable, varchar } from 'drizzle-orm/pg-core'
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

export const apiErrorRecords = pgTable(
  'api_error_records',
  {
    ...createBaseColumns('api_error_records'),
    method: varchar('method', { length: API_ERROR_RECORD_FIELD_LIMITS.method }).notNull(),
    path: varchar('path', { length: API_ERROR_RECORD_FIELD_LIMITS.path }).notNull(),
    statusCode: integer('status_code').notNull(),
    errorName: varchar('error_name', {
      length: API_ERROR_RECORD_FIELD_LIMITS.errorName,
    }).notNull(),
    message: varchar('message', { length: API_ERROR_RECORD_FIELD_LIMITS.message }).notNull(),
    stack: varchar('stack', { length: API_ERROR_RECORD_FIELD_LIMITS.stack }),
    correlationId: varchar('correlation_id', {
      length: API_ERROR_RECORD_FIELD_LIMITS.correlationId,
    }),
    fingerprint: varchar('fingerprint', { length: API_ERROR_RECORD_FIELD_LIMITS.fingerprint })
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
