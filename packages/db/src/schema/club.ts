import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { CLUB_STATUS } from '@afterdark/types'
import { createBaseColumns } from './base.ts'
import { users } from './user.ts'

export const clubs = sqliteTable('clubs', {
  ...createBaseColumns('clubs'),
  name: text('name').notNull(),
  capacity: text('capacity').notNull(),
  description: text('description'),
  ownerUserId: integer('owner_user_id')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: [CLUB_STATUS.ACTIVE, CLUB_STATUS.INACTIVE] })
    .notNull()
    .default(CLUB_STATUS.ACTIVE),
})

export type ClubSelect = typeof clubs.$inferSelect
export type ClubInsert = typeof clubs.$inferInsert
