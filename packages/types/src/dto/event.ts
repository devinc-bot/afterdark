import type { EventStatus } from '../enums/event.ts'

export interface EventImageResponse {
  documentId: string
  name: string
  url: string
}

export interface EventResponse {
  documentId: string
  locationId: string
  locationName: string
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  status: EventStatus
  images: EventImageResponse[]
  createdAt: Date
  updatedAt: Date
}
