import { eq } from 'drizzle-orm'
import { db } from '../client.ts'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { roles, type RoleSelect } from '../schema/role.ts'
import type { AccountSelect } from '../schema/account.ts'

export async function findAccountByEmail(email: string): Promise<AccountSelect | null> {
  const [account] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1)

  return account ?? null
}

export async function findAccountIdByEmail(email: string): Promise<number | null> {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1)

  return account?.id ?? null
}

export async function accountExistsByEmail(email: string): Promise<boolean> {
  const id = await findAccountIdByEmail(email)
  return id !== null
}

export type AccountWithRole = {
  account: AccountSelect
  role: RoleSelect
}

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

export async function findAccountEmailByEmail(email: string): Promise<string | null> {
  const [row] = await db
    .select({ email: accounts.email })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1)

  return row?.email ?? null
}

export async function findAccountDocumentIdById(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: accounts.documentId })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1)

  return row?.documentId ?? null
}
