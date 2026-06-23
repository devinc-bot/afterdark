import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { owners } from './owner.ts'

export const ownerAccountsLnk = sqliteTable('owner_account_lnk', {
  ...createBaseColumns('owner_account_lnk'),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => owners.id),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id),
})

export type OwnerAccountLnkSelect = typeof ownerAccountsLnk.$inferSelect
export type OwnerAccountLnkInsert = typeof ownerAccountsLnk.$inferInsert
