import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { roles } from './role.ts'

export const accountRolesLnk = sqliteTable('account_role_lnk', {
  ...createBaseColumns('account_role_lnk'),
  accountId: integer('account_id')
    .notNull()
    .unique()
    .references(() => accounts.id),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id),
})

export type AccountRoleLnkSelect = typeof accountRolesLnk.$inferSelect
export type AccountRoleLnkInsert = typeof accountRolesLnk.$inferInsert
