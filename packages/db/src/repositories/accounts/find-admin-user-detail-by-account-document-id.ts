import { eq } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { accounts } from '../../schema/account.ts'
import { addresses } from '../../schema/address.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { ownerAddressesLnk } from '../../schema/owner-address-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { roles } from '../../schema/role.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'
import { db } from '../../client.ts'

export type AdminUserDetailRow = {
  documentId: string
  email: string
  provider: string
  roleName: string
  createdAt: Date
  name: string | null
  lastName: string | null
  phone: string | null
  birthday: string | null
  nationalId: string | null
  status: string | null
  organizationName: string | null
  taxId: string | null
  address: { address: string; streetNumber: string; state: string; city: string } | null
}

export async function findAdminUserDetailByAccountDocumentId(
  accountDocumentId: string
): Promise<AdminUserDetailRow | null> {
  const [account] = await db
    .select({
      id: accounts.id,
      documentId: accounts.documentId,
      email: accounts.email,
      provider: accounts.provider,
      createdAt: accounts.createdAt,
      roleName: roles.name,
    })
    .from(accounts)
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(eq(accounts.documentId, accountDocumentId))
    .limit(1)

  if (!account) {
    return null
  }

  const base: AdminUserDetailRow = {
    documentId: account.documentId,
    email: account.email,
    provider: account.provider,
    roleName: account.roleName,
    createdAt: account.createdAt,
    name: null,
    lastName: null,
    phone: null,
    birthday: null,
    nationalId: null,
    status: null,
    organizationName: null,
    taxId: null,
    address: null,
  }

  if (account.roleName === USER_ROLE.USER) {
    const [profile] = await db
      .select({
        name: users.name,
        lastName: users.lastName,
        phone: users.phone,
        birthday: users.birthday,
        nationalId: users.nationalId,
        status: users.status,
      })
      .from(users)
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .where(eq(userAccountsLnk.accountId, account.id))
      .limit(1)

    return profile ? { ...base, ...profile } : base
  }

  if (account.roleName === USER_ROLE.OWNER) {
    const [profile] = await db
      .select({
        name: owners.name,
        lastName: owners.lastName,
        phone: owners.phone,
        birthday: owners.birthday,
        nationalId: owners.nationalId,
        status: owners.status,
        organizationName: organizations.name,
        taxId: organizations.taxId,
        address: addresses.address,
        streetNumber: addresses.streetNumber,
        state: addresses.state,
        city: addresses.city,
      })
      .from(owners)
      .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
      .leftJoin(organizationAccountsLnk, eq(organizationAccountsLnk.accountId, account.id))
      .leftJoin(organizations, eq(organizations.id, organizationAccountsLnk.organizationId))
      .leftJoin(ownerAddressesLnk, eq(ownerAddressesLnk.ownerId, owners.id))
      .leftJoin(addresses, eq(addresses.id, ownerAddressesLnk.addressId))
      .where(eq(ownerAccountsLnk.accountId, account.id))
      .limit(1)

    if (!profile) {
      return base
    }

    const { address, streetNumber, state, city, ...rest } = profile

    return {
      ...base,
      ...rest,
      address: address
        ? { address, streetNumber: streetNumber!, state: state!, city: city! }
        : null,
    }
  }

  if (account.roleName === USER_ROLE.STAFF) {
    const [profile] = await db
      .select({
        name: staff.name,
        lastName: staff.lastName,
        phone: staff.phone,
        status: staff.status,
      })
      .from(staff)
      .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
      .where(eq(staffAccountsLnk.accountId, account.id))
      .limit(1)

    return profile ? { ...base, ...profile } : base
  }

  return base
}
