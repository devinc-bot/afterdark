import { and, eq, inArray } from 'drizzle-orm'
import { ASSET_TYPE } from '@afterdark/types'
import { db, type Transaction } from '../client.ts'
import { clubAssetsLnk } from '../schema/club-asset-lnk.ts'
import { assets, type AssetInsert, type AssetSelect } from '../schema/asset.ts'

export type ClubImageAssetInput = {
  name: string
  url: string
  storageKey: string
}

export type ClubImageAsset = {
  clubId: number
  asset: AssetSelect
}

export async function findClubImageAssetsByClubIds(clubIds: number[]): Promise<ClubImageAsset[]> {
  if (clubIds.length === 0) {
    return []
  }

  return db
    .select({
      clubId: clubAssetsLnk.clubId,
      asset: assets,
    })
    .from(clubAssetsLnk)
    .innerJoin(assets, eq(assets.id, clubAssetsLnk.assetId))
    .where(and(inArray(clubAssetsLnk.clubId, clubIds), eq(assets.type, ASSET_TYPE.IMG)))
}

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

export async function findClubImageAssetsNotInKeepList(
  clubId: number,
  keepDocumentIds: string[]
): Promise<AssetSelect[]> {
  const keepSet = new Set(keepDocumentIds)
  const current = await findClubImageAssetsByClubIds([clubId])

  return current.filter(({ asset }) => !keepSet.has(asset.documentId)).map(({ asset }) => asset)
}

export async function deleteClubImageAssetsByIds(
  clubId: number,
  assetIds: number[]
): Promise<void> {
  if (assetIds.length === 0) {
    return
  }

  await db.transaction(async (tx: Transaction) => {
    for (const assetId of assetIds) {
      await tx
        .delete(clubAssetsLnk)
        .where(and(eq(clubAssetsLnk.clubId, clubId), eq(clubAssetsLnk.assetId, assetId)))

      await tx.delete(assets).where(eq(assets.id, assetId))
    }
  })
}

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
