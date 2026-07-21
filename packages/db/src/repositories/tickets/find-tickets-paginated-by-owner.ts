import { count, desc, eq, sql } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@afterdark/types/enums'
import type { ListTicketsByOwnerParams, PaginatedTicketsResult } from '@afterdark/types'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { buildOwnerTicketFilters } from './build-owner-ticket-filters.ts'

export async function findTicketsPaginatedByOwner(
  params: ListTicketsByOwnerParams
): Promise<PaginatedTicketsResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const where = buildOwnerTicketFilters(params)

  const totalSoldSql = sql<number>`(
    select count(*)
    from tickets_sold
    inner join orders on orders.id = tickets_sold.order_id
    where orders.ticket_id = ${tickets.id}
      and orders.status = ${PAYMENT_STATUS.COMPLETED}
  )`.mapWith(Number)

  const revenueSql = sql<number>`(
    select coalesce(sum(orders.amount), 0)
    from orders
    where orders.ticket_id = ${tickets.id}
      and orders.status = ${PAYMENT_STATUS.COMPLETED}
  )`.mapWith(Number)

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        ticket: tickets,
        event: events,
        location: locations,
        totalSold: totalSoldSql,
        revenue: revenueSql,
      })
      .from(tickets)
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(owners, eq(owners.id, locations.ownerId))
      .where(where)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(tickets)
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(owners, eq(owners.id, locations.ownerId))
      .where(where),
  ])

  return {
    rows: rows.map((row) => ({
      ticket: row.ticket,
      event: row.event,
      location: row.location,
      totalSold: row.totalSold,
      revenue: row.revenue,
    })),
    total: totalRows[0]?.total ?? 0,
  }
}
