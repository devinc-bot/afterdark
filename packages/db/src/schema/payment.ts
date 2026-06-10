import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { PAYMENT_STATUS } from '@afterdark/types'
import { baseColumns } from './base.ts'
import { clubs } from './club.ts'
import { tickets } from './ticket.ts'
import { users } from './user.ts'

export const payments = sqliteTable('payments', {
  ...baseColumns,
  ticketId: integer('ticket_id')
    .notNull()
    .references(() => tickets.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  clubId: integer('club_id')
    .notNull()
    .references(() => clubs.id),
  status: text('status', {
    enum: [
      PAYMENT_STATUS.COMPLETED,
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.REJECTED,
      PAYMENT_STATUS.CANCELLED,
    ],
  }),
  amount: real('amount').notNull(),
})

export type PaymentSelect = typeof payments.$inferSelect
export type PaymentInsert = typeof payments.$inferInsert
