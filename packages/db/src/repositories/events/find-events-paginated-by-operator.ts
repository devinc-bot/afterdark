import { and, count, desc, eq, exists, inArray, sql, type SQL } from 'drizzle-orm'
import { PURCHASE_STATUS, USER_ROLE } from '@repo/types/enums'
import type { ListEventsByOperatorParams, PaginatedEventsResult } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketsSold } from '../../schema/tickets_sold.ts'
import { purchaseItems } from '../../schema/purchase-item.ts'
import { purchases } from '../../schema/purchase.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'
import { findOrganizationsByStaffDocumentId } from '../organizations/find-organizations-by-staff-document-id.ts'
import { eventsWithLocationQuery } from './events-with-location-query.ts'
import { findEventFaqsByEventIds } from './find-event-faqs-by-event-ids.ts'

function eventHasCompletedSales(): SQL {
  return exists(
    db
      .select({ one: sql`1` })
      .from(ticketsSold)
      .innerJoin(purchaseItems, eq(purchaseItems.id, ticketsSold.purchaseItemId))
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .innerJoin(tickets, eq(tickets.id, purchaseItems.ticketId))
      .where(and(eq(tickets.eventId, events.id), eq(purchases.status, PURCHASE_STATUS.CONFIRMED)))
  )
}

export async function findEventsPaginatedByOperator(
  params: ListEventsByOperatorParams
): Promise<PaginatedEventsResult> {
  const { operatorDocumentId, operatorRole, page, limit } = params
  const offset = (page - 1) * limit

  let organizationIds: number[]

  if (operatorRole === USER_ROLE.OWNER) {
    const organization = await findSoleOrganizationByOwnerDocumentId(operatorDocumentId)
    organizationIds = organization ? [organization.id] : []
  } else if (operatorRole === USER_ROLE.STAFF) {
    const organizations = await findOrganizationsByStaffDocumentId(operatorDocumentId)
    organizationIds = organizations.map(({ id }) => id)
  } else {
    organizationIds = []
  }

  if (organizationIds.length === 0) return { rows: [], total: 0 }

  const where = params.hasSales
    ? and(inArray(events.organizationId, organizationIds), eventHasCompletedSales())
    : inArray(events.organizationId, organizationIds)

  const [rows, totalRows] = await Promise.all([
    eventsWithLocationQuery()
      .where(where)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(events).where(where),
  ])

  const faqsByEventId = await findEventFaqsByEventIds(rows.map((row) => row.event.id))

  return {
    rows: rows.map((row) => ({
      ...row,
      faqs: faqsByEventId.get(row.event.id) ?? [],
    })),
    total: totalRows[0]?.total ?? 0,
  }
}
