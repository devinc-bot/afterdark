import { db, type Transaction } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { clubAddressesLnk } from '../../schema/club-address-lnk.ts'
import { clubs } from '../../schema/club.ts'
import type { ClubUpsertInput, ClubWithAddress } from '@afterdark/types'

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
