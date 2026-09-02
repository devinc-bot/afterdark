import { check, index, integer, numeric, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { createBaseColumns } from './base.ts'
import { purchases } from './purchase.ts'
import { tickets } from './ticket.ts'

export const purchaseItems = pgTable(
  'purchase_items',
  {
    ...createBaseColumns('purchase_items'),
    purchaseId: integer('purchase_id')
      .notNull()
      .references(() => purchases.id),
    ticketId: integer('ticket_id')
      .notNull()
      .references(() => tickets.id),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2, mode: 'number' }).notNull(),
    // Preserves the authoritative accepted total when legacy units cannot divide to cents exactly.
    lineTotal: numeric('line_total', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  },
  (table) => [
    check('purchase_items_quantity_positive', sql`${table.quantity} > 0`),
    check('purchase_items_unit_price_non_negative', sql`${table.unitPrice} >= 0`),
    check('purchase_items_line_total_non_negative', sql`${table.lineTotal} >= 0`),
    uniqueIndex('purchase_items_purchase_ticket_unique').on(table.purchaseId, table.ticketId),
    index('purchase_items_ticket_id_idx').on(table.ticketId),
  ]
)

export type PurchaseItemSelect = typeof purchaseItems.$inferSelect
export type PurchaseItemInsert = typeof purchaseItems.$inferInsert
