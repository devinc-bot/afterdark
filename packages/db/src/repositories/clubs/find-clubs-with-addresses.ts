import { desc, eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { clubAddressesLnk } from '../../schema/club-address-lnk.ts'
import { clubs } from '../../schema/club.ts'
import type { ClubWithAddress } from '@afterdark/types'

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
