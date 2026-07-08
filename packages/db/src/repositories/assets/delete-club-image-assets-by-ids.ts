import { and, eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { clubAssetsLnk } from '../../schema/club-asset-lnk.ts'
import { assets } from '../../schema/asset.ts'

export async function deleteClubImageAssetsByIds(
  clubId: number,
  assetIds: number[]
): Promise<void> {
  if (assetIds.length === 0) {
    return
  }

  await db.transaction(async (tx: Transaction) => {
    for (const assetId of assetIds) {
      await tx
        .delete(clubAssetsLnk)
        .where(and(eq(clubAssetsLnk.clubId, clubId), eq(clubAssetsLnk.assetId, assetId)))

      await tx.delete(assets).where(eq(assets.id, assetId))
    }
  })
}
