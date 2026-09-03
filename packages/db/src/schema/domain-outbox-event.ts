import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { createBaseColumns } from './base.ts'

export const domainOutboxEvents = pgTable(
  'domain_outbox_events',
  {
    ...createBaseColumns('domain_outbox_events'),
    aggregateType: text('aggregate_type').notNull(),
    aggregateDocumentId: uuid('aggregate_document_id').notNull(),
    aggregateVersion: integer('aggregate_version').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    publishAttempts: integer('publish_attempts').notNull().default(0),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    lockToken: uuid('lock_token'),
    lastError: text('last_error'),
  },
  (table) => [
    uniqueIndex('domain_outbox_events_aggregate_version_unique').on(
      table.aggregateType,
      table.aggregateDocumentId,
      table.aggregateVersion
    ),
    index('domain_outbox_events_unpublished_created_at_idx')
      .on(table.createdAt)
      .where(sql`${table.publishedAt} is null`),
  ]
)

export type DomainOutboxEventSelect = typeof domainOutboxEvents.$inferSelect
export type DomainOutboxEventInsert = typeof domainOutboxEvents.$inferInsert
