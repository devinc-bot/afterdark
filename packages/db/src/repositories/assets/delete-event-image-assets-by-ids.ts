import { and, eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { eventAssetsLnk } from '../../schema/event-asset-lnk.ts'
import { assets } from '../../schema/asset.ts'

export async function deleteEventImageAssetsByIds(
  eventId: number,
  assetIds: number[]
): Promise<void> {
  if (assetIds.length === 0) {
    return
  }

  await db.transaction(async (tx: Transaction) => {
    for (const assetId of assetIds) {
      await tx
        .delete(eventAssetsLnk)
        .where(and(eq(eventAssetsLnk.eventId, eventId), eq(eventAssetsLnk.assetId, assetId)))

      await tx.delete(assets).where(eq(assets.id, assetId))
    }
  })
}
