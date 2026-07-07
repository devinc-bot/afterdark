import { and, eq, inArray } from 'drizzle-orm'
import { ASSET_TYPE } from '@afterdark/types'
import { db } from '../../client.ts'
import { clubAssetsLnk } from '../../schema/club-asset-lnk.ts'
import { assets } from '../../schema/asset.ts'
import type { ClubImageAsset } from '@afterdark/types'

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
