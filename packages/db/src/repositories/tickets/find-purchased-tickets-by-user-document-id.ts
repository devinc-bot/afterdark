import { and, desc, eq } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'
import { orders } from '../../schema/orders.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { users } from '../../schema/user.ts'

export async function findPurchasedTicketsByUserDocumentId(userDocumentId: string) {
  return db
    .select({
      ticketSold: ticketsSold,
      ticket: tickets,
      ticketType: ticketTypes,
      event: events,
      location: locations,
    })
    .from(ticketsSold)
    .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
    .innerJoin(tickets, eq(tickets.id, orders.ticketId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(users, eq(users.id, orders.userId))
    .where(and(eq(users.documentId, userDocumentId), eq(orders.status, PAYMENT_STATUS.COMPLETED)))
    .orderBy(desc(events.startsAt), desc(ticketsSold.createdAt))
}
