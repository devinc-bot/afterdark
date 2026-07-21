import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
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
})

export type LocationSelect = typeof locations.$inferSelect
export type LocationInsert = typeof locations.$inferInsert
