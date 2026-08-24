import { integer, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { TICKET_STATUS, TICKET_TYPE } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { events } from './event.ts'

export const tickets = pgTable('tickets', {
  ...createBaseColumns('tickets'),
  name: text('name').notNull(),
  price: numeric('price', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status', { enum: [TICKET_STATUS.ACTIVE, TICKET_STATUS.INACTIVE] })
    .notNull()
    .default(TICKET_STATUS.ACTIVE),
  description: text('description').notNull(),
  saleStartsAt: timestamp('sale_starts_at', { withTimezone: true }),
  saleEndsAt: timestamp('sale_ends_at', { withTimezone: true }),
  eventId: integer('event_id').references(() => events.id),
  type: text('type', { enum: [TICKET_TYPE.GENERAL, TICKET_TYPE.VIP] })
    .notNull()
    .default(TICKET_TYPE.GENERAL),
})

export type TicketSelect = typeof tickets.$inferSelect
export type TicketInsert = typeof tickets.$inferInsert
