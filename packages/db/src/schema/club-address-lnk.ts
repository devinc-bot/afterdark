import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { addresses } from './address.ts'
import { clubs } from './club.ts'

export const clubAddressesLnk = sqliteTable('club_addresses_lnk', {
  ...createBaseColumns('club_addresses_lnk'),
  clubId: integer('club_id')
    .notNull()
    .unique()
    .references(() => clubs.id),
  addressId: integer('address_id')
    .notNull()
    .unique()
    .references(() => addresses.id),
})

export type ClubAddressLnkSelect = typeof clubAddressesLnk.$inferSelect
export type ClubAddressLnkInsert = typeof clubAddressesLnk.$inferInsert
