import { and, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { locations, type LocationSelect } from '../../schema/location.ts'
import { owners } from '../../schema/owner.ts'

export async function findLocationOwnedByOwnerDocumentId(
  locationDocumentId: string,
  ownerDocumentId: string
): Promise<LocationSelect | null> {
  const [row] = await db
    .select({ location: locations })
    .from(locations)
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .where(
      and(eq(locations.documentId, locationDocumentId), eq(owners.documentId, ownerDocumentId))
    )
    .limit(1)

  return row?.location ?? null
}
