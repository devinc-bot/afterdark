import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'
import { events } from './event.ts'

export const eventFaqs = pgTable('event_faqs', {
  ...createBaseColumns('event_faqs'),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export type EventFaqSelect = typeof eventFaqs.$inferSelect
export type EventFaqInsert = typeof eventFaqs.$inferInsert
