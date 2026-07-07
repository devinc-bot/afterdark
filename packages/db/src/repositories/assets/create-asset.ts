import { db } from '../../client.ts'
import { assets, type AssetInsert, type AssetSelect } from '../../schema/asset.ts'

export async function createAsset(input: AssetInsert): Promise<AssetSelect> {
  const [asset] = await db.insert(assets).values(input).returning()

  if (!asset) {
    throw new Error('Asset insert returned no row')
  }

  return asset
}
