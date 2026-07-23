import { and, asc, count, eq, gte, lte, sql, type SQL } from 'drizzle-orm'
import { EVENT_STATUS } from '@afterdark/types/enums'
import type { ListPublishedEventsParams, PaginatedPublishedEventsResult } from '@afterdark/types'
import { db } from '../../client.ts'
import { addresses } from '../../schema/address.ts'
import { events } from '../../schema/event.ts'
import { locationAddressesLnk } from '../../schema/location-address-lnk.ts'
import { locations } from '../../schema/location.ts'

function buildPublishedEventsFilters(params: ListPublishedEventsParams): SQL {
  const conditions: SQL[] = [eq(events.status, EVENT_STATUS.PUBLISHED)]

  if (params.startsFrom) {
    conditions.push(gte(events.startsAt, params.startsFrom))
  }

  if (params.startsTo) {
    conditions.push(lte(events.startsAt, params.startsTo))
  }

  if (params.city) {
    conditions.push(sql`lower(${addresses.city}) = lower(${params.city})`)
  }

  if (params.state) {
    conditions.push(sql`lower(${addresses.state}) = lower(${params.state})`)
  }

  return and(...conditions)!
}

export async function findPublishedEventsPaginated(
  params: ListPublishedEventsParams
): Promise<PaginatedPublishedEventsResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit
  const where = buildPublishedEventsFilters(params)

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        event: events,
        location: locations,
        address: addresses,
      })
      .from(events)
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(locationAddressesLnk, eq(locationAddressesLnk.locationId, locations.id))
      .innerJoin(addresses, eq(addresses.id, locationAddressesLnk.addressId))
      .where(where)
      .orderBy(asc(events.startsAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(events)
      .innerJoin(locations, eq(locations.id, events.locationId))
      .innerJoin(locationAddressesLnk, eq(locationAddressesLnk.locationId, locations.id))
      .innerJoin(addresses, eq(addresses.id, locationAddressesLnk.addressId))
      .where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}
