import { and, eq } from 'drizzle-orm'
import { events } from '../../schema/event.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'
import { eventsWithLocationQuery } from './events-with-location-query.ts'
import { findEventFaqsByEventIds } from './find-event-faqs-by-event-ids.ts'
import type { EventWithLocation } from '@repo/types'

export async function findEventWithLocationOwnedByOwnerDocumentId(
  eventDocumentId: string,
  ownerDocumentId: string
): Promise<EventWithLocation | null> {
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return null

  const [row] = await eventsWithLocationQuery()
    .where(and(eq(events.documentId, eventDocumentId), eq(events.organizationId, organization.id)))
    .limit(1)

  if (!row) {
    return null
  }

  const faqsByEventId = await findEventFaqsByEventIds([row.event.id])

  return {
    ...row,
    faqs: faqsByEventId.get(row.event.id) ?? [],
  }
}
