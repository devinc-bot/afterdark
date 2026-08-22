import type { PublicEventsPaginatedResponse } from './event.ts'

export interface OrganizationDto {
  documentId: string
  name: string
  taxId: string | null
}

/** Anonymous organization profile with its published event catalog. */
export interface PublicOrganizationProfileResponse {
  documentId: string
  slug: string
  name: string
  avatar: string | null
  events: PublicEventsPaginatedResponse
}
