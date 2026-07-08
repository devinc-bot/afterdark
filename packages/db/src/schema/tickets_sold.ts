import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { orders } from './orders.ts'

export const ticketsSold = sqliteTable('tickets_sold', {
  ...createBaseColumns('tickets_sold'),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  qrCode: text('qr_code').notNull().unique(),
})

export type TicketSoldSelect = typeof ticketsSold.$inferSelect
export type TicketSoldInsert = typeof ticketsSold.$inferInsert
