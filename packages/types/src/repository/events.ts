import type { AddressSelect, EventFaqSelect, EventSelect, LocationSelect } from '@repo/db/schema'
import type { EventStatus } from '../enums/event.ts'

export type EventWithLocation = {
  event: EventSelect
  location: LocationSelect
  faqs: EventFaqSelect[]
}

/** FAQ row for event create/update (order = array index → sortOrder). */
export type EventFaqInput = {
  question: string
  answer: string
}

export type EventUpsertInput = {
  locationId: number
  organizationId: number
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  status: EventStatus
  faqs: EventFaqInput[]
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

/** Raw owner fields for public detail organizer mapping (display name resolved in API). */
export type PublishedEventOrganizerRow = {
  name: string
  lastName: string
  organizationName: string | null
  avatar: string | null
}

/** Published single-event detail including ordered FAQs and owner organizer fields. */
export type PublishedEventDetailRow = PublishedEventWithLocation & {
  faqs: EventFaqSelect[]
  organizer: PublishedEventOrganizerRow
}

export type PaginatedPublishedEventsResult = {
  rows: PublishedEventWithLocation[]
  total: number
}
