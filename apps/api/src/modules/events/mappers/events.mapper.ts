import type { EventSelect, LocationSelect } from '@afterdark/db'
import type { EventResponse } from '@afterdark/types'
import type { CreateEventInput, UpdateEventInput } from '@afterdark/validators'

export function toEventResponse(
  event: EventSelect,
  location: Pick<LocationSelect, 'documentId' | 'name'>
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
