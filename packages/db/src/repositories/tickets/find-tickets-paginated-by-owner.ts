import { count, desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { buildOwnerTicketFilters } from './build-owner-ticket-filters.ts'
import { ticketRelationsQuery } from './ticket-relations-query.ts'
import type { ListTicketsByOwnerParams, PaginatedTicketsResult } from '@afterdark/types'

export async function findTicketsPaginatedByOwner(
  params: ListTicketsByOwnerParams
): Promise<PaginatedTicketsResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const where = buildOwnerTicketFilters(params)

  const baseQuery = ticketRelationsQuery().where(where)

  const [rows, totalRows] = await Promise.all([
    baseQuery.orderBy(desc(tickets.createdAt)).limit(limit).offset(offset),
    db
      .select({ total: count() })
      .from(tickets)
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}
