import { and, count, eq, gte, lte, sum } from 'drizzle-orm'
import { EVENT_STATUS, PURCHASE_STATUS } from '@repo/types/enums'
import type { DashboardKpiRow, FindDashboardKpiParams } from '@repo/types'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'

export async function findDashboardKpiByOwnerDocumentId(
  params: FindDashboardKpiParams
): Promise<DashboardKpiRow> {
  const { ownerDocumentId, revenueFromDate, revenueToDate } = params
  const ownerWhere = eq(owners.documentId, ownerDocumentId)

  const [publishedEventsRows, ticketsSoldRows, revenueRows] = await Promise.all([
    db
      .select({ total: count() })
      .from(events)
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(owners, eq(owners.id, locations.ownerId))
      .where(and(ownerWhere, eq(events.status, EVENT_STATUS.PUBLISHED))),
    db
      .select({ total: count() })
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
          gte(purchases.confirmedAt, revenueFromDate),
          lte(purchases.confirmedAt, revenueToDate)
        )
      ),
    db
      .select({ total: sum(purchaseItems.lineTotal) })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(owners, eq(owners.id, locations.ownerId))
      .where(
        and(
          ownerWhere,
          eq(purchases.status, PURCHASE_STATUS.CONFIRMED),
          gte(purchases.confirmedAt, revenueFromDate),
          lte(purchases.confirmedAt, revenueToDate)
        )
      ),
  ])

  const totalRevenue = Number(revenueRows[0]?.total ?? 0)

  return {
    publishedEventsCount: publishedEventsRows[0]?.total ?? 0,
    ticketsSoldCount: ticketsSoldRows[0]?.total ?? 0,
    totalRevenue: Number.isFinite(totalRevenue) ? totalRevenue : 0,
  }
}
