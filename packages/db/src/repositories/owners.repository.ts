import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../client.ts'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { addresses } from '../schema/address.ts'
import { ownerAccountsLnk } from '../schema/owner-account-lnk.ts'
import { ownerAddressesLnk } from '../schema/owner-address-lnk.ts'
import { owners, type OwnerSelect } from '../schema/owner.ts'
import { roles } from '../schema/role.ts'

export type OwnerAddressRow = {
  address: string
  streetNumber: string
  state: string
  city: string
}

export type OwnerProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

export type OwnerProfileSeed = {
  name: string
  lastName: string
  phone: string
}

export type CurrentOwnerRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  status: OwnerSelect['status']
  email: string
  address: OwnerAddressRow | null
}

export type OwnerUpdateInput = {
  name: string
  lastName: string
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
}

export type InviterOwnerRow = {
  id: number
  documentId: string
  role: string
}

export async function findOwnerIdByDocumentId(documentId: string): Promise<number | null> {
  const [owner] = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return owner?.id ?? null
}

export async function findOwnerDocumentIdByAccountId(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: owners.documentId })
    .from(ownerAccountsLnk)
    .innerJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
    .where(eq(ownerAccountsLnk.accountId, accountId))
    .limit(1)

  return row?.documentId ?? null
}

export async function findOwnerProfileByDocumentId(
  documentId: string
): Promise<OwnerProfileRow | null> {
  const [row] = await db
    .select({
      documentId: owners.documentId,
      name: owners.name,
      lastName: owners.lastName,
      avatar: owners.avatar,
      email: accounts.email,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(accounts, eq(accounts.id, ownerAccountsLnk.accountId))
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return row ?? null
}

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

export async function upsertOwnerAddress(ownerId: number, input: OwnerAddressRow): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const [link] = await tx
      .select({ addressId: ownerAddressesLnk.addressId })
      .from(ownerAddressesLnk)
      .where(eq(ownerAddressesLnk.ownerId, ownerId))
      .limit(1)

    if (link) {
      await tx
        .update(addresses)
        .set({
          address: input.address,
          streetNumber: input.streetNumber,
          state: input.state,
          city: input.city,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, link.addressId))

      return
    }

    const [address] = await tx
      .insert(addresses)
      .values({
        address: input.address,
        streetNumber: input.streetNumber,
        state: input.state,
        city: input.city,
      })
      .returning()

    if (!address) {
      throw new Error('Address insert returned no row')
    }

    await tx.insert(ownerAddressesLnk).values({
      ownerId,
      addressId: address.id,
    })
  })
}

export async function updateOwnerByDocumentId(
  documentId: string,
  input: OwnerUpdateInput
): Promise<void> {
  await db
    .update(owners)
    .set({
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      birthday: input.birthday,
      nationalId: input.nationalId,
      taxId: input.taxId,
      updatedAt: new Date(),
    })
    .where(eq(owners.documentId, documentId))
}

export async function createOwnerWithAccountLink(
  tx: Transaction,
  accountId: number,
  profile: OwnerProfileSeed
): Promise<string> {
  const [owner] = await tx.insert(owners).values(profile).returning()

  if (!owner) {
    throw new Error('Owner insert returned no row')
  }

  await tx.insert(ownerAccountsLnk).values({
    ownerId: owner.id,
    accountId,
  })

  return owner.documentId
}

export async function findInviterOwnerWithRole(
  documentId: string
): Promise<InviterOwnerRow | null> {
  const [row] = await db
    .select({
      id: owners.id,
      documentId: owners.documentId,
      role: roles.name,
    })
    .from(owners)
    .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
    .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, ownerAccountsLnk.accountId))
    .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return row ?? null
}
