import { serial, timestamp, uuid } from 'drizzle-orm/pg-core'

export function createBaseColumns(table: string) {
  return {
    id: serial('id').primaryKey(),
    documentId: uuid('document_id').notNull().unique(`${table}_document_id_unique`).defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  }
}
