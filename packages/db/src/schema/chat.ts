import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const chats = sqliteTable('chat', {
  ...createBaseColumns('chat'),
})

export type ChatSelect = typeof chats.$inferSelect
export type ChatInsert = typeof chats.$inferInsert
