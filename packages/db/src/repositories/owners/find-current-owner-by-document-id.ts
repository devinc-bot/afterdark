import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { addresses } from '../../schema/address.ts'
import { assets } from '../../schema/asset.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { ownerAddressesLnk } from '../../schema/owner-address-lnk.ts'
import { owners } from '../../schema/owner.ts'
import type { CurrentOwnerRow } from '@repo/types'

export async function findCurrentOwnerByDocumentId(
  documentId: string
): Promise<CurrentOwnerRow | null> {
  const rows = await db
    .select({
      documentId: owners.documentId,
      name: owners.name,
      lastName: owners.lastName,
      avatar: assets.url,
      phone: owners.phone,
      birthday: owners.birthday,
      nationalId: owners.nationalId,
      organizationName: organizations.name,
      taxId: organizations.taxId,
      status: owners.status,
      email: accounts.email,
      address: addresses.address,
      streetNumber: addresses.streetNumber,
      state: addresses.state,
      city: addresses.city,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(accounts, eq(accounts.id, ownerAccountsLnk.accountId))
    .innerJoin(organizationAccountsLnk, eq(organizationAccountsLnk.accountId, accounts.id))
    .innerJoin(organizations, eq(organizations.id, organizationAccountsLnk.organizationId))
    .leftJoin(assets, eq(assets.id, owners.avatarId))
    .leftJoin(ownerAddressesLnk, eq(ownerAddressesLnk.ownerId, owners.id))
    .leftJoin(addresses, eq(addresses.id, ownerAddressesLnk.addressId))
    .where(eq(owners.documentId, documentId))
    .limit(2)

  if (rows.length !== 1) {
    return null
  }

  const row = rows[0]!
  const { address, streetNumber, state, city, ...owner } = row

  return {
    ...owner,
    address: address ? { address, streetNumber: streetNumber!, state: state!, city: city! } : null,
  }
}
