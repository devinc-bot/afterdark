import { AUTH_PROVIDER, type RegisterStaffForLocationInput } from '@repo/types'
import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staffLocationsLnk } from '../../schema/staff-location-lnk.ts'

export async function registerStaffForLocation(
  input: RegisterStaffForLocationInput
): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const [account] = await tx
      .insert(accounts)
      .values({
        email: input.email,
        password: input.hashedPassword,
        provider: AUTH_PROVIDER.LOCAL,
        providerAccountId: null,
      })
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
    await tx
      .insert(staffLocationsLnk)
      .values({ staffId: staffMember.id, locationId: input.locationId })
  })
}
