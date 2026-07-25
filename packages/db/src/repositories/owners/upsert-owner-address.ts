import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { ownerAddressesLnk } from '../../schema/owner-address-lnk.ts'
import type { OwnerAddressRow } from '@repo/types'

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
