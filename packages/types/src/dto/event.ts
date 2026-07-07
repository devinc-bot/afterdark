import type { EventStatus } from '../enums/event.ts'

export interface EventResponse {
  documentId: string
  clubId: string
  clubName: string
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}
