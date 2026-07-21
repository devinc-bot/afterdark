import { and, eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { locationAssetsLnk } from '../../schema/location-asset-lnk.ts'
import { assets } from '../../schema/asset.ts'

export async function deleteLocationImageAssetsByIds(
  locationId: number,
  assetIds: number[]
): Promise<void> {
  if (assetIds.length === 0) {
    return
  }

  await db.transaction(async (tx: Transaction) => {
    for (const assetId of assetIds) {
      await tx
        .delete(locationAssetsLnk)
        .where(
          and(eq(locationAssetsLnk.locationId, locationId), eq(locationAssetsLnk.assetId, assetId))
        )

      await tx.delete(assets).where(eq(assets.id, assetId))
    }
  })
}
