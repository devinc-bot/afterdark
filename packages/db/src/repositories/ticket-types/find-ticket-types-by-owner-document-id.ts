import { asc, eq, isNull, or, sql } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ticketTypes, type TicketTypeSelect } from '../../schema/ticket-type.ts'
import { findOwnerIdByDocumentId } from '../owners/find-owner-id-by-document-id.ts'

export async function findTicketTypesByOwnerDocumentId(
  ownerDocumentId: string
): Promise<TicketTypeSelect[]> {
  const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)
  if (!ownerId) return []

  const rows = await db
    .select({ ticketType: ticketTypes })
    .from(ticketTypes)
    .where(or(isNull(ticketTypes.ownerId), eq(ticketTypes.ownerId, ownerId)))
    .orderBy(sql`${ticketTypes.ownerId} is not null`, asc(ticketTypes.name))

  return rows.map((row) => row.ticketType)
}
