import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { LOCATION_TYPE } from '@afterdark/types/enums'
import { createBaseColumns } from './base.ts'
import { owners } from './owner.ts'

export const locations = sqliteTable('locations', {
  ...createBaseColumns('locations'),
  name: text('name').notNull(),
  capacity: text('capacity').notNull(),
  description: text('description'),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => owners.id),
  type: text('type', { enum: [LOCATION_TYPE.PERMANENT, LOCATION_TYPE.TEMPORARY] })
    .notNull()
    .default(LOCATION_TYPE.PERMANENT),
})

export type LocationSelect = typeof locations.$inferSelect
export type LocationInsert = typeof locations.$inferInsert
