import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { CLUB_STATUS } from '@afterdark/types'
import { createBaseColumns } from './base.ts'

export const clubs = sqliteTable('clubs', {
  ...createBaseColumns('clubs'),
  name: text('name').notNull(),
  capacity: text('capacity').notNull(),
  description: text('description'),
  status: text('status', { enum: [CLUB_STATUS.ACTIVE, CLUB_STATUS.INACTIVE] })
    .notNull()
    .default(CLUB_STATUS.ACTIVE),
  address: text('address').notNull(),
  streetNumber: text('street_number').notNull(),
  state: text('state').notNull(),
  city: text('city').notNull(),
})

export type ClubSelect = typeof clubs.$inferSelect
export type ClubInsert = typeof clubs.$inferInsert
