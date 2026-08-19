import { eq, inArray } from 'drizzle-orm'
import type { AdminUserTogglableStatus, OwnerStatus, StaffStatus, UserStatus } from '@repo/types'
import { USER_ROLE } from '@repo/types'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { accounts } from '../../schema/account.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { roles } from '../../schema/role.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'
import { db } from '../../client.ts'

export async function updateProfileStatusByAccountDocumentId(
  accountDocumentId: string,
  status: AdminUserTogglableStatus
): Promise<boolean> {
  const [account] = await db
    .select({ id: accounts.id, roleName: roles.name })
    .from(accounts)
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(eq(accounts.documentId, accountDocumentId))
    .limit(1)

  if (!account || account.roleName === USER_ROLE.ADMIN) {
    return false
  }

  if (account.roleName === USER_ROLE.USER) {
    const [updated] = await db
      .update(users)
      .set({ status: status as UserStatus, updatedAt: new Date() })
      .where(
        inArray(
          users.id,
          db
            .select({ id: userAccountsLnk.userId })
            .from(userAccountsLnk)
            .where(eq(userAccountsLnk.accountId, account.id))
        )
      )
      .returning({ id: users.id })
    return Boolean(updated)
  }

  if (account.roleName === USER_ROLE.OWNER) {
    const [updated] = await db
      .update(owners)
      .set({ status: status as OwnerStatus, updatedAt: new Date() })
      .where(
        inArray(
          owners.id,
          db
            .select({ id: ownerAccountsLnk.ownerId })
            .from(ownerAccountsLnk)
            .where(eq(ownerAccountsLnk.accountId, account.id))
        )
      )
      .returning({ id: owners.id })
    return Boolean(updated)
  }

  if (account.roleName === USER_ROLE.STAFF) {
    const [updated] = await db
      .update(staff)
      .set({ status: status as StaffStatus, updatedAt: new Date() })
      .where(
        inArray(
          staff.id,
          db
            .select({ id: staffAccountsLnk.staffId })
            .from(staffAccountsLnk)
            .where(eq(staffAccountsLnk.accountId, account.id))
        )
      )
      .returning({ id: staff.id })
    return Boolean(updated)
  }

  return false
}
