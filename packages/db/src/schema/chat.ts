import { pgTable } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const chats = pgTable('chat', {
  ...createBaseColumns('chat'),
})

export type ChatSelect = typeof chats.$inferSelect
export type ChatInsert = typeof chats.$inferInsert
