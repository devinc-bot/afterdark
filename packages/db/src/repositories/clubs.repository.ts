import { desc, eq } from 'drizzle-orm'
import { db, type Transaction } from '../client.ts'
import { addresses } from '../schema/address.ts'
import { clubAddressesLnk } from '../schema/club-address-lnk.ts'
import { clubAssetsLnk } from '../schema/club-asset-lnk.ts'
import { clubs, type ClubSelect } from '../schema/club.ts'
import type { AddressSelect } from '../schema/address.ts'

export type ClubWithAddress = {
  club: ClubSelect
  address: AddressSelect
}

export type ClubAddressInput = {
  address: string
  streetNumber: string
  state: string
  city: string
}

export type ClubUpsertInput = {
  name: string
  capacity: string
  description: string
  status: ClubSelect['status']
} & ClubAddressInput

export async function findClubsWithAddresses(): Promise<ClubWithAddress[]> {
  return db
    .select({
      club: clubs,
      address: addresses,
    })
    .from(clubs)
    .innerJoin(clubAddressesLnk, eq(clubAddressesLnk.clubId, clubs.id))
    .innerJoin(addresses, eq(addresses.id, clubAddressesLnk.addressId))
    .orderBy(desc(clubs.createdAt))
}

export async function findClubIdByDocumentId(documentId: string): Promise<number | null> {
  const [club] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.documentId, documentId))
    .limit(1)

  return club?.id ?? null
}

export async function findClubByDocumentId(documentId: string): Promise<ClubSelect | null> {
  const [club] = await db.select().from(clubs).where(eq(clubs.documentId, documentId)).limit(1)

  return club ?? null
}

export async function createClubWithAddress(
  ownerId: number,
  input: ClubUpsertInput
): Promise<ClubWithAddress> {
  return db.transaction(async (tx: Transaction) => {
    const [club] = await tx
      .insert(clubs)
      .values({
        name: input.name,
        capacity: input.capacity,
        description: input.description,
        ownerId,
        status: input.status,
      })
      .returning()

    if (!club) {
      throw new Error('Club insert returned no row')
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

    await tx.insert(clubAddressesLnk).values({
      clubId: club.id,
      addressId: address.id,
    })

    return { club, address }
  })
}

export async function updateClubWithAddress(
  documentId: string,
  clubId: number,
  input: ClubUpsertInput
): Promise<ClubWithAddress> {
  return db.transaction(async (tx) => {
    const now = new Date()

    const [club] = await tx
      .update(clubs)
      .set({
        name: input.name,
        capacity: input.capacity,
        description: input.description,
        status: input.status,
        updatedAt: now,
      })
      .where(eq(clubs.documentId, documentId))
      .returning()

    if (!club) {
      throw new Error('Club update returned no row')
    }

    const [link] = await tx
      .select({ addressId: clubAddressesLnk.addressId })
      .from(clubAddressesLnk)
      .where(eq(clubAddressesLnk.clubId, clubId))
      .limit(1)

    if (!link) {
      throw new Error('Club address link not found')
    }

    const [address] = await tx
      .update(addresses)
      .set({
        address: input.address,
        streetNumber: input.streetNumber,
        state: input.state,
        city: input.city,
        updatedAt: now,
      })
      .where(eq(addresses.id, link.addressId))
      .returning()

    if (!address) {
      throw new Error('Address update returned no row')
    }

    return { club, address }
  })
}

export async function deleteClubById(clubId: number): Promise<void> {
  await db.transaction(async (tx) => {
    const [link] = await tx
      .select({ addressId: clubAddressesLnk.addressId })
      .from(clubAddressesLnk)
      .where(eq(clubAddressesLnk.clubId, clubId))
      .limit(1)

    await tx.delete(clubAssetsLnk).where(eq(clubAssetsLnk.clubId, clubId))
    await tx.delete(clubAddressesLnk).where(eq(clubAddressesLnk.clubId, clubId))

    const [deletedClub] = await tx
      .delete(clubs)
      .where(eq(clubs.id, clubId))
      .returning({ id: clubs.id })

    if (!deletedClub) {
      throw new Error('Club delete returned no row')
    }

    if (link) {
      await tx.delete(addresses).where(eq(addresses.id, link.addressId))
    }
  })
}
