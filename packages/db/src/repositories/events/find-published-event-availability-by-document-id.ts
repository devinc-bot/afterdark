import { and, eq } from 'drizzle-orm'
import { EVENT_STATUS } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { findTicketsWithCompletedSalesByEventId } from '../tickets/find-tickets-with-completed-sales-by-event-id.ts'

export type PublishedEventAvailabilitySnapshot = {
  eventDocumentId: string
  version: number
  tickets: Array<{ ticketDocumentId: string; remainingQuantity: number }>
}

/** Returns only public inventory fields for a published event's SSE snapshot. */
export async function findPublishedEventAvailabilityByDocumentId(
  documentId: string
): Promise<PublishedEventAvailabilitySnapshot | null> {
  const [event] = await db
    .select({
      id: events.id,
      documentId: events.documentId,
      availabilityVersion: events.availabilityVersion,
    })
    .from(events)
    .where(and(eq(events.documentId, documentId), eq(events.status, EVENT_STATUS.PUBLISHED)))
    .limit(1)
  if (!event) return null

  const tickets = await findTicketsWithCompletedSalesByEventId(event.id)
  return {
    eventDocumentId: event.documentId,
    version: event.availabilityVersion,
    tickets: tickets.map(({ ticket, completedSalesQuantity, reservedQuantity }) => ({
      ticketDocumentId: ticket.documentId,
      remainingQuantity: Math.max(ticket.quantity - completedSalesQuantity - reservedQuantity, 0),
    })),
  }
}
