import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'

export const accounts = sqliteTable('accounts', {
  ...baseColumns,
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
})

export type AccountSelect = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert
