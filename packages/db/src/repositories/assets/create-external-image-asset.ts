import { ASSET_TYPE } from '@repo/types'
import { db, type Transaction } from '../../client.ts'
import { assets, type AssetSelect } from '../../schema/asset.ts'

export async function createExternalImageAsset(
  tx: Transaction,
  input: { url: string; name?: string }
): Promise<AssetSelect> {
  const [asset] = await tx
    .insert(assets)
    .values({
      name: input.name ?? 'avatar',
      url: input.url,
      storageKey: null,
      type: ASSET_TYPE.IMG,
    })
    .returning()

  if (!asset) {
    throw new Error('Asset insert returned no row')
  }

  return asset
}

/** Creates an external image asset outside a caller-owned transaction. */
export async function insertExternalImageAsset(input: {
  url: string
  name?: string
}): Promise<AssetSelect> {
  return db.transaction(async (tx: Transaction) => createExternalImageAsset(tx, input))
}
