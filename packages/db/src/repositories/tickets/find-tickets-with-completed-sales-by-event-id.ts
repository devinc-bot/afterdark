import { and, eq, sql, sum } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import { db } from '../../client.ts'
import { orders } from '../../schema/orders.ts'
import { tickets, type TicketSelect } from '../../schema/ticket.ts'

/** Ticket row plus units already sold via completed orders. */
export type TicketWithCompletedSales = {
  ticket: TicketSelect
  /** Sum of `orders.quantity` with status `completed` for this ticket (0 when none). */
  completedSalesQuantity: number
}

/**
 * Lists all tickets for an event with their completed sales quantity.
 *
 * Includes inactive tickets and tickets outside the sale window — callers filter for
 * public/offer display. Remaining stock is typically `ticket.quantity - completedSalesQuantity`.
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
  // SUM of joined completed order quantities; COALESCE → 0 when no rows; mapWith → JS number (SQLite may return string).
  const completedSalesQuantity = sql<number>`coalesce(${sum(orders.quantity)}, 0)`.mapWith(Number)

  const rows = await db
    .select({ ticket: tickets, completedSalesQuantity })
    .from(tickets)
    .leftJoin(
      orders,
      and(eq(orders.ticketId, tickets.id), eq(orders.status, PAYMENT_STATUS.COMPLETED))
    )
    .where(eq(tickets.eventId, eventId))
    .groupBy(tickets.id)

  return rows
}
