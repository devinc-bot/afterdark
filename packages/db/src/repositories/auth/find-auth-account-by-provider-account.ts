import { and, eq } from 'drizzle-orm'
import type { AuthAccountRow, AuthProvider, UserRole } from '@afterdark/types'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { roles } from '../../schema/role.ts'
import { findProfileDocumentId } from './find-auth-account-by-email.ts'

export async function findAuthAccountByProviderAccount(
  provider: AuthProvider,
  providerAccountId: string
): Promise<AuthAccountRow | null> {
  const [row] = await db
    .select({
      account: accounts,
      role: roles,
    })
    .from(accounts)
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)))
    .limit(1)

  if (!row) {
    return null
  }

  const sub = await findProfileDocumentId(row.account.id, row.role.name as UserRole)

  if (!sub) {
    return null
  }

  return {
    ...row,
    sub,
  }
}
