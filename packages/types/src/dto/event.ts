import type { EventStatus } from '../enums/event.ts'
import type { PaginatedResponse } from './common.ts'

export interface EventImageResponse {
  documentId: string
  name: string
  url: string
}

/** Ordered FAQ item on owner and public event detail responses. */
export interface EventFaqResponse {
  documentId: string
  question: string
  answer: string
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
  faqs: EventFaqResponse[]
  createdAt: Date
  updatedAt: Date
}

/** Anonymous discovery catalog item (published events only). */
export interface PublicEventResponse {
  documentId: string
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  locationName: string
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  images: EventImageResponse[]
}

export type PublicEventsPaginatedResponse = PaginatedResponse<PublicEventResponse>

/** Anonymous single-event detail (published events only). */
export interface PublicEventDetailAddress {
  street: string
  streetNumber: string
  city: string
  state: string
  latitude: number | null
  longitude: number | null
}

export interface PublicEventDetailResponse {
  documentId: string
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  locationName: string
  address: PublicEventDetailAddress | null
  images: EventImageResponse[]
  locationImages: EventImageResponse[]
  faqs: EventFaqResponse[]
}
