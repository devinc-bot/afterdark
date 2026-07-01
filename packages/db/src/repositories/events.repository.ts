import { and, eq } from 'drizzle-orm'
import { db } from '../client.ts'
import { clubs } from '../schema/club.ts'
import { events, type EventSelect } from '../schema/event.ts'
import { owners } from '../schema/owner.ts'

export async function findEventOwnedByOwnerDocumentId(
  eventDocumentId: string,
  ownerDocumentId: string
): Promise<EventSelect | null> {
  const [row] = await db
    .select({ event: events })
    .from(events)
    .innerJoin(clubs, eq(clubs.id, events.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .where(and(eq(events.documentId, eventDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row?.event ?? null
}
