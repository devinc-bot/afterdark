import { count, desc, eq, sql } from 'drizzle-orm'
import { PURCHASE_STATUS } from '@repo/types/enums'
import type { ListTicketsByOwnerParams, PaginatedTicketsResult } from '@repo/types'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
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
    inner join purchase_items on purchase_items.id = tickets_sold.purchase_item_id
    inner join purchases on purchases.id = purchase_items.purchase_id
    where purchase_items.ticket_id = ${tickets.id}
      and purchases.status = ${PURCHASE_STATUS.CONFIRMED}
  )`.mapWith(Number)

  const revenueSql = sql<number>`(
    select coalesce(sum(purchase_items.line_total), 0)
    from purchase_items
    inner join purchases on purchases.id = purchase_items.purchase_id
    where purchase_items.ticket_id = ${tickets.id}
      and purchases.status = ${PURCHASE_STATUS.CONFIRMED}
  )`.mapWith(Number)

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        ticket: tickets,
        ticketType: ticketTypes,
        event: events,
        location: locations,
        totalSold: totalSoldSql,
        revenue: revenueSql,
      })
      .from(tickets)
      .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
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
      ticketType: row.ticketType,
      event: row.event,
      location: row.location,
      totalSold: row.totalSold,
      revenue: row.revenue,
    })),
    total: totalRows[0]?.total ?? 0,
  }
}
