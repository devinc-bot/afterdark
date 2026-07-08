import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { owners } from '../../schema/owner.ts'

export async function findOwnerIdByDocumentId(documentId: string): Promise<number | null> {
  const [owner] = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return owner?.id ?? null
}
