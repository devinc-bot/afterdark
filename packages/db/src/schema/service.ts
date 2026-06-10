import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'

export const services = sqliteTable('services', {
  ...baseColumns,
  name: text('name').notNull(),
  description: text('description'),
})

export type ServiceSelect = typeof services.$inferSelect
export type ServiceInsert = typeof services.$inferInsert
