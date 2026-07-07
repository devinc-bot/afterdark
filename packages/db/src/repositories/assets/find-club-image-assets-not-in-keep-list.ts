import type { AssetSelect } from '../../schema/asset.ts'
import { findClubImageAssetsByClubIds } from './find-club-image-assets-by-club-ids.ts'

export async function findClubImageAssetsNotInKeepList(
  clubId: number,
  keepDocumentIds: string[]
): Promise<AssetSelect[]> {
  const keepSet = new Set(keepDocumentIds)
  const current = await findClubImageAssetsByClubIds([clubId])

  return current.filter(({ asset }) => !keepSet.has(asset.documentId)).map(({ asset }) => asset)
}
