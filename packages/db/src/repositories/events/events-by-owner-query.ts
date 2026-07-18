import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'

export function eventsByOwnerQuery() {
  return db
    .select({
      event: events,
      location: locations,
    })
    .from(events)
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
}
