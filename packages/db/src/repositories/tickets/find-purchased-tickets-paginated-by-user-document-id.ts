import { and, count, desc, eq } from 'drizzle-orm'
import { PURCHASE_STATUS } from '@repo/types/enums'
import type { ListPurchasedTicketsParams, PaginatedPurchasedTicketsResult } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { users } from '../../schema/user.ts'

export async function findPurchasedTicketsPaginatedByUserDocumentId(
  params: ListPurchasedTicketsParams
): Promise<PaginatedPurchasedTicketsResult> {
  const { userDocumentId, page, limit } = params
  const offset = (page - 1) * limit
  const where = and(
    eq(users.documentId, userDocumentId),
    eq(purchases.status, PURCHASE_STATUS.CONFIRMED)
  )

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        ticketSold: ticketsSold,
        ticket: tickets,
        ticketType: ticketTypes,
        event: events,
        location: locations,
      })
      .from(ticketsSold)
      .innerJoin(purchaseItems, eq(purchaseItems.id, ticketsSold.purchaseItemId))
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(users, eq(users.id, purchases.userId))
      .where(where)
      .orderBy(desc(events.startsAt), desc(ticketsSold.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(ticketsSold)
      .innerJoin(purchaseItems, eq(purchaseItems.id, ticketsSold.purchaseItemId))
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(users, eq(users.id, purchases.userId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}
