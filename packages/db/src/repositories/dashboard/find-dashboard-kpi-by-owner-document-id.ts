import { and, count, eq, gte, lte, sum } from 'drizzle-orm'
import { EVENT_STATUS, PAYMENT_STATUS } from '@afterdark/types/enums'
import type { DashboardKpiRow, FindDashboardKpiParams } from '@afterdark/types'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { orders } from '../../schema/orders.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'

export async function findDashboardKpiByOwnerDocumentId(
  params: FindDashboardKpiParams
): Promise<DashboardKpiRow> {
  const { ownerDocumentId, revenueFromDate, revenueToDate } = params
  const ownerWhere = eq(owners.documentId, ownerDocumentId)

  const [publishedEventsRows, ticketsSoldRows, revenueRows] = await Promise.all([
    db
      .select({ total: count() })
      .from(events)
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(and(ownerWhere, eq(events.status, EVENT_STATUS.PUBLISHED))),
    db
      .select({ total: count() })
      .from(ticketsSold)
      .innerJoin(orders, eq(orders.id, ticketsSold.orderId))
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(ownerWhere),
    db
      .select({ total: sum(orders.amount) })
      .from(orders)
      .innerJoin(tickets, eq(tickets.id, orders.ticketId))
      .innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(clubs, eq(clubs.id, events.clubId))
      .innerJoin(owners, eq(owners.id, clubs.ownerId))
      .where(
        and(
          ownerWhere,
          eq(orders.status, PAYMENT_STATUS.COMPLETED),
          gte(orders.paidAt, revenueFromDate),
          lte(orders.paidAt, revenueToDate)
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
