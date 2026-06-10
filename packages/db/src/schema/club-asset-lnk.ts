import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'
import { assets } from './asset.ts'
import { clubs } from './club.ts'

export const clubAssetsLnk = sqliteTable('club_assets_lnk', {
  ...baseColumns,
  clubId: integer('club_id')
    .notNull()
    .references(() => clubs.id),
  assetId: integer('asset_id')
    .notNull()
    .references(() => assets.id),
})

export type ClubAssetLnkSelect = typeof clubAssetsLnk.$inferSelect
export type ClubAssetLnkInsert = typeof clubAssetsLnk.$inferInsert
