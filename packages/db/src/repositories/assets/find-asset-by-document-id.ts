import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { assets, type AssetSelect } from '../../schema/asset.ts'

export async function findAssetByDocumentId(documentId: string): Promise<AssetSelect | null> {
  const [asset] = await db.select().from(assets).where(eq(assets.documentId, documentId)).limit(1)

  return asset ?? null
}
