import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locations } from '../../schema/location.ts'
import type { LocationUpsertInput, LocationWithAddress } from '@repo/types'

export async function updateLocationWithAddress(
  documentId: string,
  locationId: number,
  input: LocationUpsertInput
): Promise<LocationWithAddress> {
  return db.transaction(async (tx) => {
    const now = new Date()

    const [location] = await tx
      .update(locations)
      .set({
        name: input.name,
        capacity: input.capacity,
        description: input.description,
        updatedAt: now,
      })
      .where(eq(locations.documentId, documentId))
      .returning()

    if (!location) {
      throw new Error('Location update returned no row')
    }

    const [link] = await tx
      .select({ addressId: locationAddressesLnk.addressId })
      .from(locationAddressesLnk)
      .where(eq(locationAddressesLnk.locationId, locationId))
      .limit(1)

    if (!link) {
      throw new Error('Location address link not found')
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

    return { location, address }
  })
}
