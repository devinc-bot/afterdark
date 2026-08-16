import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { events, type EventSelect } from '../../schema/event.ts'
import { findSoleOrganizationByOwnerDocumentId } from '../organizations/find-sole-organization-by-owner-document-id.ts'

export async function findEventOwnedByOwnerDocumentId(
  eventDocumentId: string,
  ownerDocumentId: string
): Promise<EventSelect | null> {
  const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)
  if (!organization) return null

  const [row] = await db
    .select({ event: events })
    .from(events)
    .where(and(eq(events.documentId, eventDocumentId), eq(events.organizationId, organization.id)))
    .limit(1)

  return row?.event ?? null
}
