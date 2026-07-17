import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const addresses = sqliteTable('addresses', {
  ...createBaseColumns('addresses'),
  address: text('address').notNull(),
  streetNumber: text('street_number').notNull(),
  state: text('state').notNull(),
  city: text('city').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
})

export type AddressSelect = typeof addresses.$inferSelect
export type AddressInsert = typeof addresses.$inferInsert
