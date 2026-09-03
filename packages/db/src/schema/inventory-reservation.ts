import { check, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { INVENTORY_RESERVATION_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { purchaseItems } from './purchase-item.ts'

export const inventoryReservations = pgTable(
  'inventory_reservations',
  {
    ...createBaseColumns('inventory_reservations'),
    purchaseItemId: integer('purchase_item_id')
      .notNull()
      .references(() => purchaseItems.id),
    quantity: integer('quantity').notNull(),
    status: text('status', {
      enum: [
        INVENTORY_RESERVATION_STATUS.ACTIVE,
        INVENTORY_RESERVATION_STATUS.CONSUMED,
        INVENTORY_RESERVATION_STATUS.RELEASED,
        INVENTORY_RESERVATION_STATUS.EXPIRED,
      ],
    })
      .notNull()
      .default(INVENTORY_RESERVATION_STATUS.ACTIVE),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),
  },
  (table) => [
    check('inventory_reservations_quantity_positive', sql`${table.quantity} > 0`),
    check(
      'inventory_reservations_status_valid',
      sql`${table.status} in (${INVENTORY_RESERVATION_STATUS.ACTIVE}, ${INVENTORY_RESERVATION_STATUS.CONSUMED}, ${INVENTORY_RESERVATION_STATUS.RELEASED}, ${INVENTORY_RESERVATION_STATUS.EXPIRED})`
    ),
    uniqueIndex('inventory_reservations_purchase_item_unique').on(table.purchaseItemId),
    index('inventory_reservations_active_expires_at_idx')
      .on(table.expiresAt)
      .where(sql`${table.status} = ${INVENTORY_RESERVATION_STATUS.ACTIVE}`),
  ]
)

export type InventoryReservationSelect = typeof inventoryReservations.$inferSelect
export type InventoryReservationInsert = typeof inventoryReservations.$inferInsert
