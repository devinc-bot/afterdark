import { integer, sqliteTable, unique } from 'drizzle-orm/sqlite-core'
import { accounts } from './account.ts'
import { createBaseColumns } from './base.ts'
import { organizations } from './organization.ts'

export const organizationAccountsLnk = sqliteTable(
  'organization_accounts_lnk',
  {
    ...createBaseColumns('organization_accounts_lnk'),
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
  },
  (table) => [
    unique('organization_accounts_lnk_organization_id_account_id_unique').on(
      table.organizationId,
      table.accountId
    ),
  ]
)

export type OrganizationAccountLnkSelect = typeof organizationAccountsLnk.$inferSelect
export type OrganizationAccountLnkInsert = typeof organizationAccountsLnk.$inferInsert
