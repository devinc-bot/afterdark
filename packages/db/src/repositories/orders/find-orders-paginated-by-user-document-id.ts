import { and, count, desc, eq } from 'drizzle-orm'
import type { ListBuyerOrdersParams, PaginatedBuyerOrdersResult } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { orders } from '../../schema/orders.ts'
import { tickets } from '../../schema/ticket.ts'
import { users } from '../../schema/user.ts'

export async function findOrdersPaginatedByUserDocumentId(
  params: ListBuyerOrdersParams
): Promise<PaginatedBuyerOrdersResult> {
  const { userDocumentId, page, limit } = params
  const offset = (page - 1) * limit
  const where = and(eq(users.documentId, userDocumentId))

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        documentId: orders.documentId,
        status: orders.status,
        amount: orders.amount,
        quantity: orders.quantity,
        provider: orders.provider,
        paidAt: orders.paidAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        ticketId: tickets.documentId,
        ticketName: tickets.name,
        ticketType: tickets.type,
        eventId: events.documentId,
        eventName: events.name,
        eventStartsAt: events.startsAt,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .leftJoin(events, eq(events.id, tickets.eventId))
      .where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .leftJoin(events, eq(events.id, tickets.eventId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}
