import { desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { clubAddressesLnk } from '../../schema/club-address-lnk.ts'
import { clubs } from '../../schema/club.ts'
import { owners } from '../../schema/owner.ts'
import type { ClubWithAddress } from '@afterdark/types'

export async function findClubsWithAddressesByOwnerDocumentId(
  ownerDocumentId: string
): Promise<ClubWithAddress[]> {
  return db
    .select({
      club: clubs,
      address: addresses,
    })
    .from(clubs)
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .innerJoin(clubAddressesLnk, eq(clubAddressesLnk.clubId, clubs.id))
    .innerJoin(addresses, eq(addresses.id, clubAddressesLnk.addressId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(clubs.createdAt))
}
