import { eq } from 'drizzle-orm'
import { db } from '../client.ts'
import { assets, type AssetInsert, type AssetSelect } from '../schema/asset.ts'

export async function createAsset(input: AssetInsert): Promise<AssetSelect> {
  const [asset] = await db.insert(assets).values(input).returning()

  if (!asset) {
    throw new Error('Asset insert returned no row')
  }

  return asset
}

export async function findAssetByDocumentId(documentId: string): Promise<AssetSelect | null> {
  const [asset] = await db.select().from(assets).where(eq(assets.documentId, documentId)).limit(1)

  return asset ?? null
}
