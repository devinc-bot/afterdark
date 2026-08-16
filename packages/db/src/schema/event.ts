import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { EVENT_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { locations } from './location.ts'
import { organizations } from './organization.ts'

export const events = sqliteTable('events', {
  ...createBaseColumns('events'),
  locationId: integer('location_id')
    .notNull()
    .references(() => locations.id),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
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
