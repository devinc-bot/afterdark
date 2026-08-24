import { pgTable, text } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const services = pgTable('services', {
  ...createBaseColumns('services'),
  name: text('name').notNull(),
  description: text('description'),
})

export type ServiceSelect = typeof services.$inferSelect
export type ServiceInsert = typeof services.$inferInsert
