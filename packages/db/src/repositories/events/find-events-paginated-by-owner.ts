import { count, desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'
import { eventsWithLocationQuery } from './events-with-location-query.ts'
import { findEventFaqsByEventIds } from './find-event-faqs-by-event-ids.ts'
import type { ListEventsByOwnerParams, PaginatedEventsResult } from '@repo/types'

export async function findEventsPaginatedByOwner(
  params: ListEventsByOwnerParams
): Promise<PaginatedEventsResult> {
  const { ownerDocumentId, page, limit } = params
  const offset = (page - 1) * limit
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return { rows: [], total: 0 }

  const where = eq(events.organizationId, organization.id)

  const [rows, totalRows] = await Promise.all([
    eventsWithLocationQuery()
      .where(where)
      .orderBy(desc(events.startsAt))
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
