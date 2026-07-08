import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs, type ClubSelect } from '../../schema/club.ts'

export async function findClubByDocumentId(documentId: string): Promise<ClubSelect | null> {
  const [club] = await db.select().from(clubs).where(eq(clubs.documentId, documentId)).limit(1)

  return club ?? null
}
