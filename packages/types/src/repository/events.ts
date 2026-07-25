import type { AddressSelect, LocationSelect, EventSelect } from '@repo/db/schema'
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

export type ListPublishedEventsParams = {
  page: number
  limit: number
  startsFrom?: Date
  startsTo?: Date
  city?: string
  state?: string
}

export type PublishedEventWithLocation = {
  event: EventSelect
  location: LocationSelect
  address: AddressSelect
}

export type PaginatedPublishedEventsResult = {
  rows: PublishedEventWithLocation[]
  total: number
}
