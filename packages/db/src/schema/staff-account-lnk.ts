import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { accounts } from './account.ts'
import { staff } from './staff.ts'

export const staffAccountsLnk = sqliteTable('staff_account_lnk', {
  ...createBaseColumns('staff_account_lnk'),
  staffId: integer('staff_id')
    .notNull()
    .references(() => staff.id),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id),
})

export type StaffAccountLnkSelect = typeof staffAccountsLnk.$inferSelect
export type StaffAccountLnkInsert = typeof staffAccountsLnk.$inferInsert
