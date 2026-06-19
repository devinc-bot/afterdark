import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { addresses } from './address.ts'
import { users } from './user.ts'

export const userAddressesLnk = sqliteTable('user_addresses_lnk', {
  ...createBaseColumns('user_addresses_lnk'),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  addressId: integer('address_id')
    .notNull()
    .unique()
    .references(() => addresses.id),
})

export type UserAddressLnkSelect = typeof userAddressesLnk.$inferSelect
export type UserAddressLnkInsert = typeof userAddressesLnk.$inferInsert
