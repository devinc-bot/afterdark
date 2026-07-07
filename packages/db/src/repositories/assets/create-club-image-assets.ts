import { ASSET_TYPE } from '@afterdark/types'
import { db, type Transaction } from '../../client.ts'
import { clubAssetsLnk } from '../../schema/club-asset-lnk.ts'
import { assets, type AssetSelect } from '../../schema/asset.ts'
import type { ClubImageAssetInput } from '@afterdark/types'

export async function createClubImageAssets(
  clubId: number,
  images: ClubImageAssetInput[]
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

      await tx.insert(clubAssetsLnk).values({
        clubId,
        assetId: asset.id,
      })

      created.push(asset)
    }

    return created
  })
}
