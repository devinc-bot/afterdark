import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'

export function eventsByOwnerQuery() {
  return db
    .select({
      event: events,
      club: clubs,
    })
    .from(events)
    .innerJoin(clubs, eq(clubs.id, events.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
}
