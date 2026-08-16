import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { locations } from '../../schema/location.ts'

export function eventsWithLocationQuery() {
  return db
    .select({
      event: events,
      location: locations,
    })
    .from(events)
    .innerJoin(locations, eq(locations.id, events.locationId))
}
