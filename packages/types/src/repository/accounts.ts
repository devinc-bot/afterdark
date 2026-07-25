import type { AccountSelect, RoleSelect } from '@repo/db/schema'

export type AccountWithRole = {
  account: AccountSelect
  role: RoleSelect
}
