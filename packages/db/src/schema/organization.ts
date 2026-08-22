import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const organizations = sqliteTable('organizations', {
  ...createBaseColumns('organizations'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique('organizations_slug_unique'),
  taxId: text('tax_id'),
})

export type OrganizationSelect = typeof organizations.$inferSelect
export type OrganizationInsert = typeof organizations.$inferInsert
