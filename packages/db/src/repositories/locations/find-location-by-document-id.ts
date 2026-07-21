import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations, type LocationSelect } from '../../schema/location.ts'

export async function findLocationByDocumentId(documentId: string): Promise<LocationSelect | null> {
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.documentId, documentId))
    .limit(1)

  return location ?? null
}
