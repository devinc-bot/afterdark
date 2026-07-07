import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { clubs, type ClubSelect } from '../../schema/club.ts'
import { owners } from '../../schema/owner.ts'

export async function findClubOwnedByOwnerDocumentId(
  clubDocumentId: string,
  ownerDocumentId: string
): Promise<ClubSelect | null> {
  const [row] = await db
    .select({ club: clubs })
    .from(clubs)
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .where(and(eq(clubs.documentId, clubDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row?.club ?? null
}
