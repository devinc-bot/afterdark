import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'
import { events } from '../../schema/event.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketTypes } from '../../schema/ticket-type.ts'
import type { TicketWithRelations } from '@repo/types'

export async function findTicketRelationsByTicketId(
  ticketId: number
): Promise<TicketWithRelations> {
  const [row] = await db
    .select({
      ticket: tickets,
      ticketType: ticketTypes,
      event: events,
      location: locations,
    })
    .from(tickets)
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .leftJoin(events, eq(events.id, tickets.eventId))
    .leftJoin(locations, eq(locations.id, events.locationId))
    .where(eq(tickets.id, ticketId))
    .limit(1)

  if (!row) {
    throw new Error('Ticket not found after upsert')
  }

  return row
}
