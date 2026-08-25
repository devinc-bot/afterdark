import { integer, pgTable } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'
import { locations } from './location.ts'

export const locationAssetsLnk = pgTable('location_assets_lnk', {
  ...createBaseColumns('location_assets_lnk'),
  locationId: integer('location_id')
    .notNull()
    .references(() => locations.id),
  assetId: integer('asset_id')
    .notNull()
    .references(() => assets.id),
})

export type LocationAssetLnkSelect = typeof locationAssetsLnk.$inferSelect
export type LocationAssetLnkInsert = typeof locationAssetsLnk.$inferInsert
