import { and, eq } from 'drizzle-orm'
import { owners } from '../../schema/owner.ts'
import { tickets } from '../../schema/ticket.ts'
import { ticketRelationsQuery } from './ticket-relations-query.ts'
import type { TicketWithRelations } from '@afterdark/types'

export async function findTicketWithRelationsOwnedByOwner(
  ticketDocumentId: string,
  ownerDocumentId: string
): Promise<TicketWithRelations | null> {
  const [row] = await ticketRelationsQuery()
    .where(and(eq(tickets.documentId, ticketDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row ?? null
}
