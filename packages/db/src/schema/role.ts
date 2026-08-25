import { pgTable, text } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const roles = pgTable('roles', {
  ...createBaseColumns('roles'),
  name: text('name').notNull(),
  description: text('description'),
})

export type RoleSelect = typeof roles.$inferSelect
export type RoleInsert = typeof roles.$inferInsert
