import { ASSET_TYPE } from '@afterdark/types'
import { db, type Transaction } from '../../client.ts'
import { locationAssetsLnk } from '../../schema/location-asset-lnk.ts'
import { assets, type AssetSelect } from '../../schema/asset.ts'
import type { LocationImageAssetInput } from '@afterdark/types'

export async function createLocationImageAssets(
  locationId: number,
  images: LocationImageAssetInput[]
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

      await tx.insert(locationAssetsLnk).values({
        locationId,
        assetId: asset.id,
      })

      created.push(asset)
    }

    return created
  })
}
