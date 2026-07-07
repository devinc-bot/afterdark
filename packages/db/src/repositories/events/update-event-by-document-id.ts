import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { eventsByOwnerQuery } from './events-by-owner-query.ts'
import type { EventUpsertInput, EventWithClub } from '@afterdark/types'

export async function updateEventByDocumentId(
  documentId: string,
  input: EventUpsertInput
): Promise<EventWithClub> {
  const now = new Date()

  const [event] = await db
    .update(events)
    .set({
      clubId: input.clubId,
      name: input.name,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
      updatedAt: now,
    })
    .where(eq(events.documentId, documentId))
    .returning()

  if (!event) {
    throw new Error('Event update returned no row')
  }

  const [row] = await eventsByOwnerQuery().where(eq(events.id, event.id)).limit(1)

  if (!row) {
    throw new Error('Event not found after update')
  }

  return row
}
