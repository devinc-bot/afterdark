import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { addresses } from '../../schema/address.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { ownerAddressesLnk } from '../../schema/owner-address-lnk.ts'
import { owners } from '../../schema/owner.ts'
import type { CurrentOwnerRow } from '@repo/types'

export async function findCurrentOwnerByDocumentId(
  documentId: string
): Promise<CurrentOwnerRow | null> {
  const [row] = await db
    .select({
      documentId: owners.documentId,
      name: owners.name,
      lastName: owners.lastName,
      avatar: owners.avatar,
      phone: owners.phone,
      birthday: owners.birthday,
      nationalId: owners.nationalId,
      organizationName: owners.organizationName,
      taxId: owners.taxId,
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
    .leftJoin(ownerAddressesLnk, eq(ownerAddressesLnk.ownerId, owners.id))
    .leftJoin(addresses, eq(addresses.id, ownerAddressesLnk.addressId))
    .where(eq(owners.documentId, documentId))
    .limit(1)

  if (!row) {
    return null
  }

  const { address, streetNumber, state, city, ...owner } = row

  return {
    ...owner,
    address: address ? { address, streetNumber: streetNumber!, state: state!, city: city! } : null,
  }
}
