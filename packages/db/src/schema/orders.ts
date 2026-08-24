import { integer, jsonb, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { tickets } from './ticket.ts'
import { users } from './user.ts'

export const orders = pgTable('orders', {
  ...createBaseColumns('orders'),
  ticketId: integer('ticket_id')
    .notNull()
    .references(() => tickets.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  status: text('status', {
    enum: [
      PAYMENT_STATUS.COMPLETED,
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.REJECTED,
      PAYMENT_STATUS.CANCELLED,
    ],
  }),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  provider: text('provider', { enum: [PAYMENT_PROVIDER.MERCADO_PAGO] })
    .notNull()
    .default(PAYMENT_PROVIDER.MERCADO_PAGO),
  /** Provider order id (e.g. Mercado Pago Order id) for webhook reconciliation. */
  externalOrderId: text('external_order_id').unique(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
})

export type OrderSelect = typeof orders.$inferSelect
export type OrderInsert = typeof orders.$inferInsert
