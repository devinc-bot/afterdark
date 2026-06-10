import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'
import { chats } from './chat.ts'
import { users } from './user.ts'

export const messages = sqliteTable('messages', {
  ...baseColumns,
  fromId: integer('from_id')
    .notNull()
    .references(() => users.id),
  toId: integer('to_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id),
})

export type MessageSelect = typeof messages.$inferSelect
export type MessageInsert = typeof messages.$inferInsert
