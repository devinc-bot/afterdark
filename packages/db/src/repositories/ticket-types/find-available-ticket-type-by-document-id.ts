import { and, eq, isNull, or } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ticketTypes, type TicketTypeSelect } from '../../schema/ticket-type.ts'
import { findOwnerIdByDocumentId } from '../owners/find-owner-id-by-document-id.ts'

export async function findAvailableTicketTypeByDocumentId(
  ticketTypeDocumentId: string,
  ownerDocumentId: string
): Promise<TicketTypeSelect | null> {
  const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)
  if (!ownerId) return null

  const [row] = await db
    .select({ ticketType: ticketTypes })
    .from(ticketTypes)
    .where(
      and(
        eq(ticketTypes.documentId, ticketTypeDocumentId),
        or(isNull(ticketTypes.ownerId), eq(ticketTypes.ownerId, ownerId))
      )
    )
    .limit(1)

  return row?.ticketType ?? null
}
