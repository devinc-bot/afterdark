import type { AuthProvider } from '../enums/auth.ts'
import type { UserRole } from '../enums/user.ts'
import type { AccountWithRole } from './accounts.ts'
import type { OwnerProfileSeed } from './owners.ts'

export type ProfileSeed = OwnerProfileSeed

export type AuthAccountRow = AccountWithRole & {
  sub: string
}

export type RegisterAccountInput = {
  email: string
  hashedPassword: string | null
  roleId: number
  roleName: UserRole
  profile: ProfileSeed
  provider?: AuthProvider
  providerAccountId?: string | null
}

export type RegisterStaffForClubInput = RegisterAccountInput & { clubId: number }
