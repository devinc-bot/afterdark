import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '../../client.ts'
import { ticketTypes, type TicketTypeSelect } from '../../schema/ticket-type.ts'

export async function findTicketTypeByNameForOwner(
  name: string,
  ownerId: number
): Promise<TicketTypeSelect | null> {
  const [row] = await db
    .select({ ticketType: ticketTypes })
    .from(ticketTypes)
    .where(
      and(
        eq(ticketTypes.ownerId, ownerId),
        isNotNull(ticketTypes.ownerId),
        sql`lower(${ticketTypes.name}) = lower(${name})`
      )
    )
    .limit(1)

  return row?.ticketType ?? null
}
