import type { AssetSelect } from '../../schema/asset.ts'
import { findLocationImageAssetsByLocationIds } from './find-location-image-assets-by-location-ids.ts'

export async function findLocationImageAssetsNotInKeepList(
  locationId: number,
  keepDocumentIds: string[]
): Promise<AssetSelect[]> {
  const keepSet = new Set(keepDocumentIds)
  const current = await findLocationImageAssetsByLocationIds([locationId])

  return current.filter(({ asset }) => !keepSet.has(asset.documentId)).map(({ asset }) => asset)
}
