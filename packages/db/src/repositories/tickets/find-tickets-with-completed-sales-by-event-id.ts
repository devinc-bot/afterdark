import { eq, sql } from 'drizzle-orm'
import { INVENTORY_RESERVATION_STATUS, PURCHASE_STATUS } from '@repo/types/enums'
import { db } from '../../client.ts'
import { inventoryReservations } from '../../schema/inventory-reservation.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'
import { tickets, type TicketSelect } from '../../schema/ticket.ts'
import { ticketTypes, type TicketTypeSelect } from '../../schema/ticket-type.ts'

/** Ticket row plus confirmed and actively reserved normalized units. */
export type TicketWithCompletedSales = {
  ticket: TicketSelect
  ticketType: TicketTypeSelect
  /** Sum of confirmed purchase-item quantities for this ticket (0 when none). */
  completedSalesQuantity: number
  /** Sum of unexpired active reservations for this ticket (0 when none). */
  reservedQuantity: number
}

/**
 * Lists all tickets for an event with their completed sales quantity.
 *
 * Includes inactive tickets and tickets outside the sale window — callers filter for
 * public/offer display. Remaining stock excludes confirmed units and active reservations.
 *
 * @param eventId - Internal numeric event id (`events.id`)
 *
 * @example
 * ```ts
 * const rows = await findTicketsWithCompletedSalesByEventId(event.id)
 * // [
 * //   { ticket: { id: 1, name: 'General', quantity: 100, ... }, completedSalesQuantity: 12 },
 * //   { ticket: { id: 2, name: 'VIP', quantity: 20, ... }, completedSalesQuantity: 0 },
 * // ]
 * const remaining = rows.map(({ ticket, completedSalesQuantity }) => ({
 *   documentId: ticket.documentId,
 *   remainingQuantity: ticket.quantity - completedSalesQuantity,
 * }))
 * ```
 */
export async function findTicketsWithCompletedSalesByEventId(
  eventId: number
): Promise<TicketWithCompletedSales[]> {
  const completedSalesQuantity = sql<number>`coalesce((
    select sum(${purchaseItems.quantity})
    from ${purchaseItems}
    inner join ${purchases} on ${purchases.id} = ${purchaseItems.purchaseId}
    where ${purchaseItems.ticketId} = ${tickets.id}
      and ${purchases.status} = ${PURCHASE_STATUS.CONFIRMED}
  ), 0)`.mapWith(Number)
  const reservedQuantity = sql<number>`coalesce((
    select sum(${inventoryReservations.quantity})
    from ${inventoryReservations}
    inner join ${purchaseItems} on ${purchaseItems.id} = ${inventoryReservations.purchaseItemId}
    where ${purchaseItems.ticketId} = ${tickets.id}
      and ${inventoryReservations.status} = ${INVENTORY_RESERVATION_STATUS.ACTIVE}
      and ${inventoryReservations.expiresAt} > now()
  ), 0)`.mapWith(Number)

  const rows = await db
    .select({ ticket: tickets, ticketType: ticketTypes, completedSalesQuantity, reservedQuantity })
    .from(tickets)
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .where(eq(tickets.eventId, eventId))

  return rows
}
