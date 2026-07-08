import type { ClubSelect, EventSelect } from '@afterdark/db/schema'
import type { EventStatus } from '../enums/event.ts'

export type EventWithClub = {
  event: EventSelect
  club: ClubSelect
}

export type EventUpsertInput = {
  clubId: number
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
  rows: EventWithClub[]
  total: number
}
