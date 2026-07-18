import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { addresses } from './address.ts'
import { locations } from './location.ts'

export const locationAddressesLnk = sqliteTable('location_addresses_lnk', {
  ...createBaseColumns('location_addresses_lnk'),
  locationId: integer('location_id')
    .notNull()
    .unique()
    .references(() => locations.id),
  addressId: integer('address_id')
    .notNull()
    .unique()
    .references(() => addresses.id),
})

export type LocationAddressLnkSelect = typeof locationAddressesLnk.$inferSelect
export type LocationAddressLnkInsert = typeof locationAddressesLnk.$inferInsert
