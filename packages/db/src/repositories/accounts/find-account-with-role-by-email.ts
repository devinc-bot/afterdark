import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { roles } from '../../schema/role.ts'
import type { AccountWithRole } from '@afterdark/types'

export async function findAccountWithRoleByEmail(email: string): Promise<AccountWithRole | null> {
  const [row] = await db
    .select({
      account: accounts,
      role: roles,
    })
    .from(accounts)
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(eq(accounts.email, email))
    .limit(1)

  return row ?? null
}
