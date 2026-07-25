import { and, eq, inArray } from 'drizzle-orm'
import { ASSET_TYPE } from '@repo/types'
import type { EventImageAsset } from '@repo/types'
import { db } from '../../client.ts'
import { eventAssetsLnk } from '../../schema/event-asset-lnk.ts'
import { assets } from '../../schema/asset.ts'

export async function findEventImageAssetsByEventIds(
  eventIds: number[]
): Promise<EventImageAsset[]> {
  if (eventIds.length === 0) {
    return []
  }

  return db
    .select({
      eventId: eventAssetsLnk.eventId,
      asset: assets,
    })
    .from(eventAssetsLnk)
    .innerJoin(assets, eq(assets.id, eventAssetsLnk.assetId))
    .where(and(inArray(eventAssetsLnk.eventId, eventIds), eq(assets.type, ASSET_TYPE.IMG)))
}
