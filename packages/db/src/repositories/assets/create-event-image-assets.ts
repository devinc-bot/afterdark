import { ASSET_TYPE } from '@afterdark/types'
import type { EventImageAssetInput } from '@afterdark/types'
import { db, type Transaction } from '../../client.ts'
import { eventAssetsLnk } from '../../schema/event-asset-lnk.ts'
import { assets, type AssetSelect } from '../../schema/asset.ts'

export async function createEventImageAssets(
  eventId: number,
  images: EventImageAssetInput[]
): Promise<AssetSelect[]> {
  if (images.length === 0) {
    return []
  }

  return db.transaction(async (tx: Transaction) => {
    const created: AssetSelect[] = []

    for (const image of images) {
      const [asset] = await tx
        .insert(assets)
        .values({
          name: image.name,
          url: image.url,
          storageKey: image.storageKey,
          type: ASSET_TYPE.IMG,
        })
        .returning()

      if (!asset) {
        throw new Error('Asset insert returned no row')
      }

      await tx.insert(eventAssetsLnk).values({
        eventId,
        assetId: asset.id,
      })

      created.push(asset)
    }

    return created
  })
}
