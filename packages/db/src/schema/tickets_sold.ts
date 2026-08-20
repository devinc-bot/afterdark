import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { USER_ROLE } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { orders } from './orders.ts'

export const ticketsSold = sqliteTable('tickets_sold', {
  ...createBaseColumns('tickets_sold'),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  qrCode: text('qr_code').notNull().unique(),
  checkedIn: integer('checked_in', { mode: 'boolean' }).notNull().default(false),
  usedAt: integer('used_at', { mode: 'timestamp_ms' }),
  checkedInByAccountId: integer('checked_in_by_account_id').references(() => accounts.id),
  checkedInByRole: text('checked_in_by_role', {
    enum: [USER_ROLE.OWNER, USER_ROLE.STAFF],
  }),
})

export type TicketSoldSelect = typeof ticketsSold.$inferSelect
export type TicketSoldInsert = typeof ticketsSold.$inferInsert
