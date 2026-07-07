import type { UserRole } from '../enums/user.ts'
import type { AccountWithRole } from './accounts.ts'
import type { OwnerProfileSeed } from './owners.ts'

export type ProfileSeed = OwnerProfileSeed

export type AuthAccountRow = AccountWithRole & {
  sub: string
}

export type RegisterAccountInput = {
  email: string
  hashedPassword: string
  roleId: number
  roleName: UserRole
  profile: ProfileSeed
}

export type RegisterStaffForClubInput = RegisterAccountInput & { clubId: number }
