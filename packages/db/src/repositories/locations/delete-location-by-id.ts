import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locationAssetsLnk } from '../../schema/location-asset-lnk.ts'
import { locations } from '../../schema/location.ts'

export async function deleteLocationById(locationId: number): Promise<void> {
  await db.transaction(async (tx) => {
    const [link] = await tx
      .select({ addressId: locationAddressesLnk.addressId })
      .from(locationAddressesLnk)
      .where(eq(locationAddressesLnk.locationId, locationId))
      .limit(1)

    await tx.delete(locationAssetsLnk).where(eq(locationAssetsLnk.locationId, locationId))
    await tx.delete(locationAddressesLnk).where(eq(locationAddressesLnk.locationId, locationId))

    const [deletedLocation] = await tx
      .delete(locations)
      .where(eq(locations.id, locationId))
      .returning({ id: locations.id })

    if (!deletedLocation) {
      throw new Error('Location delete returned no row')
    }

    if (link) {
      await tx.delete(addresses).where(eq(addresses.id, link.addressId))
    }
  })
}
