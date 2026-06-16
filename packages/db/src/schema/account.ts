import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const accounts = sqliteTable('accounts', {
  ...createBaseColumns('accounts'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
})

export type AccountSelect = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert
