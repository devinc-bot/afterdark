import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { clubAddressesLnk } from '../../schema/club-address-lnk.ts'
import { clubAssetsLnk } from '../../schema/club-asset-lnk.ts'
import { clubs } from '../../schema/club.ts'

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
