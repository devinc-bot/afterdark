import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { tickets } from './ticket.ts'
import { users } from './user.ts'

export const orders = sqliteTable('orders', {
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
  amount: real('amount').notNull(),
  quantity: integer('quantity').notNull().default(1),
  provider: text('provider', { enum: [PAYMENT_PROVIDER.MERCADO_PAGO] })
    .notNull()
    .default(PAYMENT_PROVIDER.MERCADO_PAGO),
  /** Provider order id (e.g. Mercado Pago Order id) for webhook reconciliation. */
  externalOrderId: text('external_order_id').unique(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
})

export type OrderSelect = typeof orders.$inferSelect
export type OrderInsert = typeof orders.$inferInsert
