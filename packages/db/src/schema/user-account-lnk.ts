import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.ts'
import { accounts } from './account.ts'
import { roles } from './role.ts'
import { users } from './user.ts'

export const userAccountsLnk = sqliteTable('user_accounts_lnk', {
  ...baseColumns,
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id),
})

export type UserAccountLnkSelect = typeof userAccountsLnk.$inferSelect
export type UserAccountLnkInsert = typeof userAccountsLnk.$inferInsert
