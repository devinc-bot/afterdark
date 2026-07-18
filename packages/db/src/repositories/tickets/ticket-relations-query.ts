import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'

export function ticketRelationsQuery() {
  return db
    .select({
      ticket: tickets,
      event: events,
      location: locations,
    })
    .from(tickets)
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
}
