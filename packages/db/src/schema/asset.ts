import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ASSET_TYPE } from '@afterdark/types'
import { createBaseColumns } from './base.ts'

export const assets = sqliteTable('assets', {
  ...createBaseColumns('assets'),
  name: text('name').notNull(),
  url: text('url'),
  type: text('type', { enum: [ASSET_TYPE.IMG, ASSET_TYPE.VIDEO] }),
})

export type AssetSelect = typeof assets.$inferSelect
export type AssetInsert = typeof assets.$inferInsert
