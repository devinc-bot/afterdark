import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'

export function ticketRelationsQuery() {
  return db
    .select({
      ticket: tickets,
      event: events,
      club: clubs,
    })
    .from(tickets)
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(clubs, eq(clubs.id, events.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
}
