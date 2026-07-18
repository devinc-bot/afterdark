import type { LocationSelect, EventSelect } from '@afterdark/db/schema'
import type { EventStatus } from '../enums/event.ts'

export type EventWithLocation = {
  event: EventSelect
  location: LocationSelect
}

export type EventUpsertInput = {
  locationId: number
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  status: EventStatus
}

export type ListEventsByOwnerParams = {
  ownerDocumentId: string
  page: number
  limit: number
}

export type PaginatedEventsResult = {
  rows: EventWithLocation[]
  total: number
}
