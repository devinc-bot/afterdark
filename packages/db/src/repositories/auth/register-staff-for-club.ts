import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staffClubsLnk } from '../../schema/staff-club-lnk.ts'
import type { RegisterStaffForClubInput } from '@afterdark/types'

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
