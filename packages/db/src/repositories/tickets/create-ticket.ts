import { db } from '../../client.ts'
import { tickets } from '../../schema/ticket.ts'
import { findTicketRelationsByTicketId } from './find-ticket-relations-by-ticket-id.ts'
import type { TicketUpsertInput, TicketWithRelations } from '@afterdark/types'

export async function createTicket(input: TicketUpsertInput): Promise<TicketWithRelations> {
  const now = new Date()

  const [ticket] = await db
    .insert(tickets)
    .values({
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      description: input.description,
      status: input.status,
      type: input.type,
      saleStartsAt: input.saleStartsAt ?? null,
      saleEndsAt: input.saleEndsAt ?? null,
      eventId: input.eventId ?? null,
      updatedAt: now,
    })
    .returning()

  if (!ticket) {
    throw new Error('Ticket insert returned no row')
  }

  return findTicketRelationsByTicketId(ticket.id)
}
