import type { AccountSelect, RoleSelect } from '@afterdark/db/schema'

export type AccountWithRole = {
  account: AccountSelect
  role: RoleSelect
}
