import { integer, text } from 'drizzle-orm/sqlite-core'

export const baseColumns = {
  id: integer('id').primaryKey({ autoIncrement: true }),
  documentId: text('document_id')
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}
