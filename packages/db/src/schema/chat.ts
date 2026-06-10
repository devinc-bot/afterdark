import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'

export const chats = sqliteTable('chat', {
  ...baseColumns,
})

export type ChatSelect = typeof chats.$inferSelect
export type ChatInsert = typeof chats.$inferInsert
