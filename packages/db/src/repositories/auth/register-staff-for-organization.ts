import { AUTH_PROVIDER, type RegisterStaffForOrganizationInput } from '@repo/types'
import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'

export async function registerStaffForOrganization(
  input: RegisterStaffForOrganizationInput
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
      .insert(organizationAccountsLnk)
      .values({ accountId: account.id, organizationId: input.organizationId })
  })
}
