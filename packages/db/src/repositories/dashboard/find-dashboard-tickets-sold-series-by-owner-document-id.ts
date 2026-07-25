import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { PAYMENT_STATUS } from '@repo/types/enums'
import type {
  DashboardTicketsSoldSeriesPoint,
  FindDashboardTicketsSoldSeriesParams,
} from '@repo/types'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { orders } from '../../schema/orders.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'

export async function findDashboardTicketsSoldSeriesByOwnerDocumentId(
  params: FindDashboardTicketsSoldSeriesParams
): Promise<DashboardTicketsSoldSeriesPoint[]> {
  const { ownerDocumentId, fromDate, toDate, granularity } = params
  const ownerWhere = eq(owners.documentId, ownerDocumentId)

  const bucketExpr =
    granularity === 'day'
      ? sql<string>`strftime('%Y-%m-%d', ${orders.paidAt}, 'unixepoch', 'localtime')`
      : sql<string>`strftime('%Y-%m', ${orders.paidAt}, 'unixepoch', 'localtime')`

  const rows = await db
    .select({
      periodKey: bucketExpr,
      ticketsSoldCount: count(),
    })
    .from(ticketsSold)
    .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
    .innerJoin(tickets, eq(tickets.id, orders.ticketId))
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .where(
      and(
        ownerWhere,
        eq(orders.status, PAYMENT_STATUS.COMPLETED),
        gte(orders.paidAt, fromDate),
        lte(orders.paidAt, toDate)
      )
    )
    .groupBy(bucketExpr)

  return rows.map((row) => ({
    periodKey: row.periodKey,
    ticketsSoldCount: row.ticketsSoldCount,
  }))
}
