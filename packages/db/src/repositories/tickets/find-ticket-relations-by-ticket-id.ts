import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'
import { events } from '../../schema/event.ts'
import { tickets } from '../../schema/ticket.ts'
import type { TicketWithRelations } from '@afterdark/types'

export async function findTicketRelationsByTicketId(
  ticketId: number
): Promise<TicketWithRelations> {
  const [row] = await db
    .select({
      ticket: tickets,
      event: events,
      club: clubs,
    })
    .from(tickets)
    .leftJoin(events, eq(events.id, tickets.eventId))
    .leftJoin(clubs, eq(clubs.id, events.clubId))
    .where(eq(tickets.id, ticketId))
    .limit(1)

  if (!row) {
    throw new Error('Ticket not found after upsert')
  }

  return row
}
