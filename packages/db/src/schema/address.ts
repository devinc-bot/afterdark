import { doublePrecision, pgTable, text } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const addresses = pgTable('addresses', {
  ...createBaseColumns('addresses'),
  address: text('address').notNull(),
  streetNumber: text('street_number').notNull(),
  state: text('state').notNull(),
  city: text('city').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
})

export type AddressSelect = typeof addresses.$inferSelect
export type AddressInsert = typeof addresses.$inferInsert
