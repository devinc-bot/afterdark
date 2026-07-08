import { and, eq } from 'drizzle-orm'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { eventsByOwnerQuery } from './events-by-owner-query.ts'
import type { EventWithClub } from '@afterdark/types'

export async function findEventWithClubOwnedByOwnerDocumentId(
  eventDocumentId: string,
  ownerDocumentId: string
): Promise<EventWithClub | null> {
  const [row] = await eventsByOwnerQuery()
    .where(and(eq(events.documentId, eventDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row ?? null
}
