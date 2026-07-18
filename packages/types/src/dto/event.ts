import type { EventStatus } from '../enums/event.ts'

export interface EventResponse {
  documentId: string
  locationId: string
  locationName: string
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}
