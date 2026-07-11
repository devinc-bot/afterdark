import type { ClubSelect, EventSelect } from '@afterdark/db'
import type { EventResponse } from '@afterdark/types'
import type { CreateEventInput, UpdateEventInput } from '@afterdark/validators'

export function toEventResponse(
  event: EventSelect,
  club: Pick<ClubSelect, 'documentId' | 'name'>
): EventResponse {
  return {
    documentId: event.documentId,
    clubId: club.documentId,
    clubName: club.name,
    name: event.name,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    status: event.status,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

export function toEventUpsertInput(input: CreateEventInput | UpdateEventInput, clubId: number) {
  return {
    clubId,
    name: input.name,
    description: input.description,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: input.status,
  }
}
