import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations } from '../../schema/location.ts'

export async function findLocationIdByDocumentId(documentId: string): Promise<number | null> {
  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.documentId, documentId))
    .limit(1)

  return location?.id ?? null
}
