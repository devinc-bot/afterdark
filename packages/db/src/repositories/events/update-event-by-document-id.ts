import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'
import { replaceEventFaqs } from './replace-event-faqs.ts'
import type { EventUpsertInput, EventWithLocation } from '@repo/types'

export async function updateEventByDocumentId(
  documentId: string,
  input: EventUpsertInput
): Promise<EventWithLocation> {
  return db.transaction(async (tx: Transaction) => {
    const now = new Date()

    const [event] = await tx
      .update(events)
      .set({
        locationId: input.locationId,
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

    const faqs = await replaceEventFaqs(tx, event.id, input.faqs)

    const [row] = await tx
      .select({
        event: events,
        location: locations,
      })
      .from(events)
      .innerJoin(locations, eq(locations.id, events.locationId))
      .where(eq(events.id, event.id))
      .limit(1)

    if (!row) {
      throw new Error('Event not found after update')
    }

    return {
      ...row,
      faqs,
    }
  })
}
