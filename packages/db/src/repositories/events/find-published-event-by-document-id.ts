import { and, eq } from 'drizzle-orm'
import { EVENT_STATUS } from '@repo/types/enums'
import type { PublishedEventWithLocation } from '@repo/types'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { events } from '../../schema/event.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locations } from '../../schema/location.ts'

export async function findPublishedEventByDocumentId(
  documentId: string
): Promise<PublishedEventWithLocation | null> {
  const [row] = await db
    .select({
      event: events,
      location: locations,
      address: addresses,
    })
    .from(events)
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(locationAddressesLnk, eq(locationAddressesLnk.locationId, locations.id))
    .innerJoin(addresses, eq(addresses.id, locationAddressesLnk.addressId))
    .where(and(eq(events.documentId, documentId), eq(events.status, EVENT_STATUS.PUBLISHED)))
    .limit(1)

  return row ?? null
}
