import type { UserRole } from '@repo/types'
import { USER_ROLE } from '@repo/types'
import { findAccountDocumentIdById } from '../accounts/find-account-document-id-by-id.ts'
import { findAccountWithRoleByEmail } from '../accounts/find-account-with-role-by-email.ts'
import { findOwnerDocumentIdByAccountId } from '../owners/find-owner-document-id-by-account-id.ts'
import { findStaffDocumentIdByAccountId } from '../staff/find-staff-document-id-by-account-id.ts'
import { findUserDocumentIdByAccountId } from '../users/find-user-document-id-by-account-id.ts'
import type { AuthAccountRow } from '@repo/types'

export async function findAuthAccountByEmail(email: string): Promise<AuthAccountRow | null> {
  const row = await findAccountWithRoleByEmail(email)

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

export async function findProfileDocumentId(
  accountId: number,
  roleName: UserRole
): Promise<string | null> {
  if (roleName === USER_ROLE.OWNER) {
    return findOwnerDocumentIdByAccountId(accountId)
  }

  if (roleName === USER_ROLE.STAFF) {
    return findStaffDocumentIdByAccountId(accountId)
  }

  if (roleName === USER_ROLE.USER) {
    return findUserDocumentIdByAccountId(accountId)
  }

  if (roleName === USER_ROLE.ADMIN) {
    return findAccountDocumentIdById(accountId)
  }

  return null
}
