import { integer, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { TICKET_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { events } from './event.ts'
import { ticketTypes } from './ticket-type.ts'

export const tickets = pgTable('tickets', {
  ...createBaseColumns('tickets'),
  price: numeric('price', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status', { enum: [TICKET_STATUS.ACTIVE, TICKET_STATUS.INACTIVE] })
    .notNull()
    .default(TICKET_STATUS.ACTIVE),
  description: text('description').notNull(),
  saleStartsAt: timestamp('sale_starts_at', { withTimezone: true }),
  saleEndsAt: timestamp('sale_ends_at', { withTimezone: true }),
  eventId: integer('event_id').references(() => events.id),
  ticketTypeId: integer('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id),
})

export type TicketSelect = typeof tickets.$inferSelect
export type TicketInsert = typeof tickets.$inferInsert
