import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'

export const roles = sqliteTable('roles', {
  ...baseColumns,
  name: text('name').notNull(),
  description: text('description'),
})

export type RoleSelect = typeof roles.$inferSelect
export type RoleInsert = typeof roles.$inferInsert
