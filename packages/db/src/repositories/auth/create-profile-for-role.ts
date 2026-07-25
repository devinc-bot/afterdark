import type { UserRole } from '@repo/types'
import { USER_ROLE } from '@repo/types'
import type { Transaction } from '../../client.ts'
import { createOwnerWithAccountLink } from '../owners/create-owner-with-account-link.ts'
import type { OwnerProfileSeed } from '@repo/types'
import { createStaffWithAccountLink } from '../staff/create-staff-with-account-link.ts'
import type { StaffProfileSeed } from '@repo/types'
import { createUserWithAccountLink } from '../users/create-user-with-account-link.ts'
import type { UserProfileSeed } from '@repo/types'

export async function createProfileForRole(
  tx: Transaction,
  accountId: number,
  roleName: UserRole,
  profile: OwnerProfileSeed | StaffProfileSeed | UserProfileSeed
): Promise<string> {
  if (roleName === USER_ROLE.OWNER) {
    return createOwnerWithAccountLink(tx, accountId, profile)
  }

  if (roleName === USER_ROLE.STAFF) {
    return createStaffWithAccountLink(tx, accountId, profile)
  }

  if (roleName === USER_ROLE.USER) {
    return createUserWithAccountLink(tx, accountId, profile)
  }

  throw new Error(`Unsupported role for registration: ${roleName}`)
}
