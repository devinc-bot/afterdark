import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { TICKET_STATUS, TICKET_TYPE } from '@afterdark/types'
import { createBaseColumns } from './base.ts'
import { events } from './event.ts'

export const tickets = sqliteTable('tickets', {
  ...createBaseColumns('tickets'),
  name: text('name').notNull(),
  price: real('price').notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status', { enum: [TICKET_STATUS.ACTIVE, TICKET_STATUS.INACTIVE] })
    .notNull()
    .default(TICKET_STATUS.ACTIVE),
  description: text('description').notNull(),
  saleStartsAt: integer('sale_starts_at', { mode: 'timestamp' }),
  saleEndsAt: integer('sale_ends_at', { mode: 'timestamp' }),
  eventId: integer('event_id').references(() => events.id),
  type: text('type', { enum: [TICKET_TYPE.GENERAL, TICKET_TYPE.VIP] })
    .notNull()
    .default(TICKET_TYPE.GENERAL),
})

export type TicketSelect = typeof tickets.$inferSelect
export type TicketInsert = typeof tickets.$inferInsert
