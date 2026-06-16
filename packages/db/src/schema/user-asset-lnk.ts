import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { USER_ASSET_LINK_TYPE } from '@afterdark/types'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'
import { users } from './user.ts'

export const userAssetsLnk = sqliteTable('user_assets_lnk', {
  ...createBaseColumns('user_assets_lnk'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  assetId: integer('asset_id')
    .notNull()
    .references(() => assets.id),
  type: text('type', { enum: [USER_ASSET_LINK_TYPE.POST, USER_ASSET_LINK_TYPE.HISTORY] }),
})

export type UserAssetLnkSelect = typeof userAssetsLnk.$inferSelect
export type UserAssetLnkInsert = typeof userAssetsLnk.$inferInsert
