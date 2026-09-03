import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { USER_ROLE } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { orders } from './orders.ts'
import { purchaseItems } from './purchase-item.ts'

export const ticketsSold = pgTable(
  'tickets_sold',
  {
    ...createBaseColumns('tickets_sold'),
    // Retained to read historical rows; normalized issuance never writes this column.
    orderId: integer('order_id').references(() => orders.id),
    purchaseItemId: integer('purchase_item_id')
      .notNull()
      .references(() => purchaseItems.id),
    unitIndex: integer('unit_index').notNull(),
    qrCode: text('qr_code').notNull().unique(),
    checkedIn: boolean('checked_in').notNull().default(false),
    usedAt: timestamp('used_at', { precision: 3, withTimezone: true }),
    checkedInByAccountId: integer('checked_in_by_account_id').references(() => accounts.id),
    checkedInByRole: text('checked_in_by_role', {
      enum: [USER_ROLE.OWNER, USER_ROLE.STAFF],
    }),
  },
  (table) => [
    uniqueIndex('tickets_sold_purchase_item_unit_index_unique').on(
      table.purchaseItemId,
      table.unitIndex
    ),
  ]
)

export type TicketSoldSelect = typeof ticketsSold.$inferSelect
export type TicketSoldInsert = typeof ticketsSold.$inferInsert
