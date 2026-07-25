import { and, eq, inArray } from 'drizzle-orm'
import { ASSET_TYPE } from '@repo/types'
import { db } from '../../client.ts'
import { locationAssetsLnk } from '../../schema/location-asset-lnk.ts'
import { assets } from '../../schema/asset.ts'
import type { LocationImageAsset } from '@repo/types'

export async function findLocationImageAssetsByLocationIds(
  locationIds: number[]
): Promise<LocationImageAsset[]> {
  if (locationIds.length === 0) {
    return []
  }

  return db
    .select({
      locationId: locationAssetsLnk.locationId,
      asset: assets,
    })
    .from(locationAssetsLnk)
    .innerJoin(assets, eq(assets.id, locationAssetsLnk.assetId))
    .where(and(inArray(locationAssetsLnk.locationId, locationIds), eq(assets.type, ASSET_TYPE.IMG)))
}
