import { db, type Transaction } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locations } from '../../schema/location.ts'
import type { LocationUpsertInput, LocationWithAddress } from '@afterdark/types'

export async function createLocationWithAddress(
  ownerId: number,
  input: LocationUpsertInput
): Promise<LocationWithAddress> {
  return db.transaction(async (tx: Transaction) => {
    const [location] = await tx
      .insert(locations)
      .values({
        name: input.name,
        capacity: input.capacity,
        description: input.description,
        ownerId,
      })
      .returning()

    if (!location) {
      throw new Error('Location insert returned no row')
    }

    const [address] = await tx
      .insert(addresses)
      .values({
        address: input.address,
        streetNumber: input.streetNumber,
        state: input.state,
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
      })
      .returning()

    if (!address) {
      throw new Error('Address insert returned no row')
    }

    await tx.insert(locationAddressesLnk).values({
      locationId: location.id,
      addressId: address.id,
    })

    return { location, address }
  })
}
