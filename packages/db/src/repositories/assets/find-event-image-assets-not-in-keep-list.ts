import type { AssetSelect } from '../../schema/asset.ts'
import { findEventImageAssetsByEventIds } from './find-event-image-assets-by-event-ids.ts'

export async function findEventImageAssetsNotInKeepList(
  eventId: number,
  keepDocumentIds: string[]
): Promise<AssetSelect[]> {
  const keepSet = new Set(keepDocumentIds)
  const current = await findEventImageAssetsByEventIds([eventId])

  return current.filter(({ asset }) => !keepSet.has(asset.documentId)).map(({ asset }) => asset)
}
