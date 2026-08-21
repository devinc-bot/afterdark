import { and, eq } from 'drizzle-orm'
import { EVENT_STATUS } from '@repo/types/enums'
import type { PublishedEventDetailRow } from '@repo/types'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { assets } from '../../schema/asset.ts'
import { events } from '../../schema/event.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locations } from '../../schema/location.ts'
import { organizations } from '../../schema/organization.ts'
import { owners } from '../../schema/owner.ts'
import { findEventFaqsByEventIds } from './find-event-faqs-by-event-ids.ts'

export async function findPublishedEventByDocumentId(
  documentId: string
): Promise<PublishedEventDetailRow | null> {
  const [row] = await db
    .select({
      event: events,
      location: locations,
      address: addresses,
      organizer: {
        documentId: organizations.documentId,
        name: owners.name,
        lastName: owners.lastName,
        organizationName: organizations.name,
        avatar: assets.url,
      },
    })
    .from(events)
    .innerJoin(locations, eq(locations.id, events.locationId))
    .innerJoin(organizations, eq(organizations.id, events.organizationId))
    .innerJoin(owners, eq(owners.id, locations.ownerId))
    .leftJoin(assets, eq(assets.id, owners.avatarId))
    .innerJoin(locationAddressesLnk, eq(locationAddressesLnk.locationId, locations.id))
    .innerJoin(addresses, eq(addresses.id, locationAddressesLnk.addressId))
    .where(and(eq(events.documentId, documentId), eq(events.status, EVENT_STATUS.PUBLISHED)))
    .limit(1)

  if (!row) {
    return null
  }

  const faqsByEventId = await findEventFaqsByEventIds([row.event.id])

  return {
    ...row,
    organizer: {
      documentId: row.organizer.documentId,
      name: row.organizer.name,
      lastName: row.organizer.lastName,
      organizationName: row.organizer.organizationName,
      avatar: row.organizer.avatar ?? null,
    },
    faqs: faqsByEventId.get(row.event.id) ?? [],
  }
}
