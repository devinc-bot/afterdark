import { and, eq } from 'drizzle-orm'
import { EVENT_STATUS } from '@repo/types'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'
import { tickets, type TicketSelect } from '../../schema/ticket.ts'

export async function findPublicTicketByDocumentId(
  documentId: string
): Promise<TicketSelect | null> {
  const [row] = await db
    .select({ ticket: tickets })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(eq(tickets.documentId, documentId), eq(events.status, EVENT_STATUS.PUBLISHED)))
    .limit(1)

  return row?.ticket ?? null
}
