import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { CLUB_STATUS } from '@afterdark/types'
import { createBaseColumns } from './base.ts'
import { owners } from './owner.ts'

export const clubs = sqliteTable('clubs', {
  ...createBaseColumns('clubs'),
  name: text('name').notNull(),
  capacity: text('capacity').notNull(),
  description: text('description'),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => owners.id),
  status: text('status', { enum: [CLUB_STATUS.ACTIVE, CLUB_STATUS.INACTIVE] })
    .notNull()
    .default(CLUB_STATUS.ACTIVE),
})

export type ClubSelect = typeof clubs.$inferSelect
export type ClubInsert = typeof clubs.$inferInsert
