import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { eventsByOwnerQuery } from './events-by-owner-query.ts'
import type { EventUpsertInput, EventWithClub } from '@afterdark/types'

export async function createEvent(input: EventUpsertInput): Promise<EventWithClub> {
  const now = new Date()

  const [event] = await db
    .insert(events)
    .values({
      clubId: input.clubId,
      name: input.name,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
      updatedAt: now,
    })
    .returning()

  if (!event) {
    throw new Error('Event insert returned no row')
  }

  const [row] = await eventsByOwnerQuery().where(eq(events.id, event.id)).limit(1)

  if (!row) {
    throw new Error('Event not found after insert')
  }

  return row
}
