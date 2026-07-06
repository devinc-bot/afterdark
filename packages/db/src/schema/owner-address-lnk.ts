import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { addresses } from './address.ts'
import { owners } from './owner.ts'

export const ownerAddressesLnk = sqliteTable('owner_addresses_lnk', {
  ...createBaseColumns('owner_addresses_lnk'),
  ownerId: integer('owner_id')
    .notNull()
    .unique()
    .references(() => owners.id),
  addressId: integer('address_id')
    .notNull()
    .unique()
    .references(() => addresses.id),
})

export type OwnerAddressLnkSelect = typeof ownerAddressesLnk.$inferSelect
export type OwnerAddressLnkInsert = typeof ownerAddressesLnk.$inferInsert
