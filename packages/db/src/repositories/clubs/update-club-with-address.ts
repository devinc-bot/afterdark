import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { clubAddressesLnk } from '../../schema/club-address-lnk.ts'
import { clubs } from '../../schema/club.ts'
import type { ClubUpsertInput, ClubWithAddress } from '@afterdark/types'

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
        latitude: input.latitude,
        longitude: input.longitude,
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
