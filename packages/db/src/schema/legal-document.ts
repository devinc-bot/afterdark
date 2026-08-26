import { boolean, jsonb, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const legalDocumentTypeEnum = pgEnum('legal_document_type', [
  'termsDashboard',
  'termsWeb',
  'privacyDashboard',
  'privacyWeb',
])

export const legalDocuments = pgTable('legal_documents', {
  ...createBaseColumns('legal_documents'),
  type: legalDocumentTypeEnum('type').notNull(),
  version: varchar('version', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  requiresAcceptance: boolean('requires_acceptance').default(true).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
})

export type LegalDocumentSelect = typeof legalDocuments.$inferSelect
export type LegalDocumentInsert = typeof legalDocuments.$inferInsert
