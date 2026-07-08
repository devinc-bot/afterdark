import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { tickets } from '../../schema/ticket.ts'

export async function deleteTicketByDocumentId(documentId: string): Promise<void> {
  const [deleted] = await db
    .delete(tickets)
    .where(eq(tickets.documentId, documentId))
    .returning({ id: tickets.id })

  if (!deleted) {
    throw new Error('Ticket delete returned no row')
  }
}
