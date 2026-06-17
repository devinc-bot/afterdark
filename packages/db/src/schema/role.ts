import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const roles = sqliteTable('roles', {
  ...createBaseColumns('roles'),
  name: text('name').notNull(),
  description: text('description'),
})

export type RoleSelect = typeof roles.$inferSelect
export type RoleInsert = typeof roles.$inferInsert
