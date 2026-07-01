import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { EVENT_STATUS } from '@afterdark/types'
import { createBaseColumns } from './base.ts'
import { clubs } from './club.ts'

export const events = sqliteTable('events', {
  ...createBaseColumns('events'),
  clubId: integer('club_id')
    .notNull()
    .references(() => clubs.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp' }).notNull(),
  location: text('location'),
  status: text('status', {
    enum: [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED, EVENT_STATUS.FINISHED],
  })
    .notNull()
    .default(EVENT_STATUS.DRAFT),
})

export type EventSelect = typeof events.$inferSelect
export type EventInsert = typeof events.$inferInsert
