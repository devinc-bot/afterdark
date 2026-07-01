import { db, type Transaction } from '../client.ts'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { staff } from '../schema/staff.ts'
import { staffAccountsLnk } from '../schema/staff-account-lnk.ts'
import { staffClubsLnk } from '../schema/staff-club-lnk.ts'
import type { UserRole } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import { createOwnerWithAccountLink, type OwnerProfileSeed } from './owners.repository.ts'
import { createStaffWithAccountLink, type StaffProfileSeed } from './staff.repository.ts'
import { createUserWithAccountLink, type UserProfileSeed } from './users.repository.ts'
import {
  findAccountDocumentIdById,
  findAccountWithRoleByEmail,
  type AccountWithRole,
} from './accounts.repository.ts'
import { findOwnerDocumentIdByAccountId } from './owners.repository.ts'
import { findStaffDocumentIdByAccountId } from './staff.repository.ts'
import { findUserDocumentIdByAccountId } from './users.repository.ts'

export type ProfileSeed = OwnerProfileSeed

export type AuthAccountRow = AccountWithRole & {
  sub: string
}

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

export type RegisterAccountInput = {
  email: string
  hashedPassword: string
  roleId: number
  roleName: UserRole
  profile: ProfileSeed
}

export async function registerAccount(input: RegisterAccountInput): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const [account] = await tx
      .insert(accounts)
      .values({
        email: input.email,
        password: input.hashedPassword,
      })
      .returning()

    if (!account) {
      throw new Error('Account insert returned no row')
    }

    await createProfileForRole(tx, account.id, input.roleName, input.profile)

    await tx.insert(accountRolesLnk).values({
      accountId: account.id,
      roleId: input.roleId,
    })
  })
}

export type RegisterStaffForClubInput = RegisterAccountInput & { clubId: number }

export async function registerStaffForClub(input: RegisterStaffForClubInput): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const [account] = await tx
      .insert(accounts)
      .values({ email: input.email, password: input.hashedPassword })
      .returning()

    if (!account) {
      throw new Error('Account insert returned no row')
    }

    const [staffMember] = await tx.insert(staff).values(input.profile).returning()

    if (!staffMember) {
      throw new Error('Staff insert returned no row')
    }

    await tx.insert(staffAccountsLnk).values({ staffId: staffMember.id, accountId: account.id })
    await tx.insert(accountRolesLnk).values({ accountId: account.id, roleId: input.roleId })
    await tx.insert(staffClubsLnk).values({ staffId: staffMember.id, clubId: input.clubId })
  })
}

async function createProfileForRole(
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
