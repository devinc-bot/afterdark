import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'
import { replaceEventFaqs } from './replace-event-faqs.ts'
import type { EventUpsertInput, EventWithLocation } from '@repo/types'

export async function createEvent(input: EventUpsertInput): Promise<EventWithLocation> {
  return db.transaction(async (tx: Transaction) => {
    const now = new Date()

    const [event] = await tx
      .insert(events)
      .values({
        locationId: input.locationId,
        organizationId: input.organizationId,
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
      throw new Error('Event not found after insert')
    }

    return {
      ...row,
      faqs,
    }
  })
}
