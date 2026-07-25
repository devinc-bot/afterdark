import { desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locations } from '../../schema/location.ts'
import { owners } from '../../schema/owner.ts'
import type { LocationWithAddress } from '@repo/types'

export async function findLocationsWithAddressesByOwnerDocumentId(
  ownerDocumentId: string
): Promise<LocationWithAddress[]> {
  return db
    .select({
      location: locations,
      address: addresses,
    })
    .from(locations)
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .innerJoin(locationAddressesLnk, eq(locationAddressesLnk.locationId, locations.id))
    .innerJoin(addresses, eq(addresses.id, locationAddressesLnk.addressId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(locations.createdAt))
}
