import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs } from '../../schema/club.ts'

export async function findClubIdByDocumentId(documentId: string): Promise<number | null> {
  const [club] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.documentId, documentId))
    .limit(1)

  return club?.id ?? null
}
