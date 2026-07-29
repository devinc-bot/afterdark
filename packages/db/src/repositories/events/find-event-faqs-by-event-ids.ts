import { asc, inArray } from 'drizzle-orm'
import { db } from '../../client.ts'
import { eventFaqs, type EventFaqSelect } from '../../schema/event-faq.ts'

export async function findEventFaqsByEventIds(
  eventIds: number[]
): Promise<Map<number, EventFaqSelect[]>> {
  const map = new Map<number, EventFaqSelect[]>()

  if (eventIds.length === 0) {
    return map
  }

  const rows = await db
    .select()
    .from(eventFaqs)
    .where(inArray(eventFaqs.eventId, eventIds))
    .orderBy(asc(eventFaqs.sortOrder), asc(eventFaqs.id))

  for (const row of rows) {
    const list = map.get(row.eventId) ?? []
    list.push(row)
    map.set(row.eventId, list)
  }

  return map
}
