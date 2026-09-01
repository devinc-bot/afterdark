import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { PURCHASE_STATUS } from '@repo/types/enums'
import type {
  DashboardTicketsSoldSeriesPoint,
  FindDashboardTicketsSoldSeriesParams,
} from '@repo/types'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'

const DASHBOARD_TIME_ZONE = 'America/Argentina/Buenos_Aires'

export async function findDashboardTicketsSoldSeriesByOwnerDocumentId(
  params: FindDashboardTicketsSoldSeriesParams
): Promise<DashboardTicketsSoldSeriesPoint[]> {
  const { ownerDocumentId, fromDate, toDate, granularity } = params
  const ownerWhere = eq(owners.documentId, ownerDocumentId)

  const bucketExpr =
    granularity === 'day'
      ? sql<string>`to_char(${purchases.confirmedAt} AT TIME ZONE ${sql.raw(`'${DASHBOARD_TIME_ZONE}'`)}, 'YYYY-MM-DD')`
      : sql<string>`to_char(${purchases.confirmedAt} AT TIME ZONE ${sql.raw(`'${DASHBOARD_TIME_ZONE}'`)}, 'YYYY-MM')`

  const rows = await db
    .select({
      periodKey: bucketExpr,
      ticketsSoldCount: count(),
    })
    .from(ticketsSold)
    .innerJoin(purchaseItems, eq(purchaseItems.id, ticketsSold.purchaseItemId))
    .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
    .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .where(
      and(
        ownerWhere,
        eq(purchases.status, PURCHASE_STATUS.CONFIRMED),
        gte(purchases.confirmedAt, fromDate),
        lte(purchases.confirmedAt, toDate)
      )
    )
    .groupBy(bucketExpr)

  return rows.map((row) => ({
    periodKey: row.periodKey,
    ticketsSoldCount: row.ticketsSoldCount,
  }))
}
