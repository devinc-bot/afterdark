import type { AssetSelect, EventSelect, LocationSelect } from '@afterdark/db'
import type { EventImageResponse, EventResponse } from '@afterdark/types'
import type { CreateEventInput, UpdateEventInput } from '@afterdark/validators'

export function toEventImageResponse(asset: AssetSelect): EventImageResponse {
  return {
    documentId: asset.documentId,
    name: asset.name,
    url: asset.url ?? '',
  }
}

export function toEventResponse(
  event: EventSelect,
  location: Pick<LocationSelect, 'documentId' | 'name'>,
  images: EventImageResponse[] = []
): EventResponse {
  return {
    documentId: event.documentId,
    locationId: location.documentId,
    locationName: location.name,
    name: event.name,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    status: event.status,
    images,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

export function toEventUpsertInput(input: CreateEventInput | UpdateEventInput, locationId: number) {
  return {
    locationId,
    name: input.name,
    description: input.description,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: input.status,
  }
}

export function groupEventImagesByEventId(
  imageRows: { eventId: number; asset: AssetSelect }[]
): Map<number, EventImageResponse[]> {
  const map = new Map<number, EventImageResponse[]>()

  for (const { eventId, asset } of imageRows) {
    const images = map.get(eventId) ?? []
    images.push(toEventImageResponse(asset))
    map.set(eventId, images)
  }

  return map
}
