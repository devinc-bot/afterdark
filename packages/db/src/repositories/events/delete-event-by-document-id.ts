import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { events } from '../../schema/event.ts'

export async function deleteEventByDocumentId(documentId: string): Promise<void> {
  const [deleted] = await db
    .delete(events)
    .where(eq(events.documentId, documentId))
    .returning({ id: events.id })

  if (!deleted) {
    throw new Error('Event delete returned no row')
  }
}
