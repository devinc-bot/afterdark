import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { EVENT_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { locations } from './location.ts'
import { organizations } from './organization.ts'

export const events = pgTable('events', {
  ...createBaseColumns('events'),
  locationId: integer('location_id')
    .notNull()
    .references(() => locations.id),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique('events_slug_unique'),
  description: text('description').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  location: text('location'),
  status: text('status', {
    enum: [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED, EVENT_STATUS.FINISHED],
  })
    .notNull()
    .default(EVENT_STATUS.DRAFT),
})

export type EventSelect = typeof events.$inferSelect
export type EventInsert = typeof events.$inferInsert
