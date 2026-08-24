import { and, eq } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import type { PurchasedTicketWithRelationsByDocumentId } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'
import { orders } from '../../schema/orders.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { users } from '../../schema/user.ts'

export async function findPurchasedTicketByDocumentIdAndUserDocumentId(params: {
  ticketSoldDocumentId: string
  userDocumentId: string
}): Promise<PurchasedTicketWithRelationsByDocumentId | undefined> {
  const { ticketSoldDocumentId, userDocumentId } = params

  const [row] = await db
    .select({
      ticketSold: ticketsSold,
      ticket: tickets,
      event: events,
      location: locations,
    })
    .from(ticketsSold)
    .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
    .innerJoin(tickets, eq(tickets.id, orders.ticketId))
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(users, eq(users.id, orders.userId))
    .where(
      and(
        eq(ticketsSold.documentId, ticketSoldDocumentId),
        eq(users.documentId, userDocumentId),
        eq(orders.status, PAYMENT_STATUS.COMPLETED)
      )
    )

  return row
}
