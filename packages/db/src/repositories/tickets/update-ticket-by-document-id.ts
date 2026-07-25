import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { tickets } from '../../schema/ticket.ts'
import { findTicketRelationsByTicketId } from './find-ticket-relations-by-ticket-id.ts'
import type { TicketUpsertInput, TicketWithRelations } from '@repo/types'

export async function updateTicketByDocumentId(
  documentId: string,
  input: TicketUpsertInput
): Promise<TicketWithRelations> {
  const now = new Date()

  const [ticket] = await db
    .update(tickets)
    .set({
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
    .where(eq(tickets.documentId, documentId))
    .returning()

  if (!ticket) {
    throw new Error('Ticket update returned no row')
  }

  return findTicketRelationsByTicketId(ticket.id)
}
