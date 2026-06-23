import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { users } from './user.ts'

export const userAccountsLnk = sqliteTable('user_accounts_lnk', {
  ...createBaseColumns('user_accounts_lnk'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id),
})

export type UserAccountLnkSelect = typeof userAccountsLnk.$inferSelect
export type UserAccountLnkInsert = typeof userAccountsLnk.$inferInsert
