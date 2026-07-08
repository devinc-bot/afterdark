import { count, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { tickets } from '../../schema/ticket.ts'

export async function countTicketsByEventId(eventId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(tickets)
    .where(eq(tickets.eventId, eventId))

  return row?.total ?? 0
}
