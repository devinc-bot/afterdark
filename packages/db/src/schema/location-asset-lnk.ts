import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'
import { locations } from './location.ts'

export const locationAssetsLnk = sqliteTable('location_assets_lnk', {
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
