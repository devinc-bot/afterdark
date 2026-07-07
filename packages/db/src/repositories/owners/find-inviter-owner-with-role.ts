import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { roles } from '../../schema/role.ts'
import type { InviterOwnerRow } from '@afterdark/types'

export async function findInviterOwnerWithRole(
  documentId: string
): Promise<InviterOwnerRow | null> {
  const [row] = await db
    .select({
      id: owners.id,
      documentId: owners.documentId,
      role: roles.name,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, ownerAccountsLnk.accountId))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return row ?? null
}
