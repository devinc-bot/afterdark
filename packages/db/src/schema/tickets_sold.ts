import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { orders } from './orders.ts'

export const ticketsSold = sqliteTable('tickets_sold', {
  ...createBaseColumns('tickets_sold'),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  qrCode: text('qr_code').notNull().unique(),
  checkedIn: integer('checked_in', { mode: 'boolean' }).notNull().default(false),
  usedAt: integer('used_at', { mode: 'timestamp_ms' }),
})

export type TicketSoldSelect = typeof ticketsSold.$inferSelect
export type TicketSoldInsert = typeof ticketsSold.$inferInsert
