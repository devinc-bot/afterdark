import { integer, pgTable } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'
import { events } from './event.ts'

export const eventAssetsLnk = pgTable('event_assets_lnk', {
  ...createBaseColumns('event_assets_lnk'),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  assetId: integer('asset_id')
    .notNull()
    .references(() => assets.id),
})

export type EventAssetLnkSelect = typeof eventAssetsLnk.$inferSelect
export type EventAssetLnkInsert = typeof eventAssetsLnk.$inferInsert
