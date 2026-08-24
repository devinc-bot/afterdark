import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { USER_ROLE } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { orders } from './orders.ts'

export const ticketsSold = pgTable('tickets_sold', {
  ...createBaseColumns('tickets_sold'),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  qrCode: text('qr_code').notNull().unique(),
  checkedIn: boolean('checked_in').notNull().default(false),
  usedAt: timestamp('used_at', { precision: 3, withTimezone: true }),
  checkedInByAccountId: integer('checked_in_by_account_id').references(() => accounts.id),
  checkedInByRole: text('checked_in_by_role', {
    enum: [USER_ROLE.OWNER, USER_ROLE.STAFF],
  }),
})

export type TicketSoldSelect = typeof ticketsSold.$inferSelect
export type TicketSoldInsert = typeof ticketsSold.$inferInsert
