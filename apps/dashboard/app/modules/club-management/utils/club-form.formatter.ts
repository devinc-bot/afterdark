import type { ClubResponse } from '@afterdark/types'
import type { ClubFormValues } from '~/modules/club-management/components/club-form'
import type { RegisteredClub } from '~/modules/club-management/components/registered-club-records'

export function clubResponseToFormValues(club: ClubResponse): Partial<ClubFormValues> {
  return {
    name: club.name,
    address: club.address,
    capacity: club.capacity,
    description: club.description ?? '',
    status: club.status,
    state: club.state,
    street_number: club.streetNumber,
    city: club.city,
    existingImages: club.images,
    clubImg: [],
  }
}

export function registeredClubToFormValues(club: RegisteredClub): Partial<ClubFormValues> {
  return {
    name: club.name,
    address: club.address,
    capacity: club.capacity ?? '',
    description: club.description ?? '',
    status: club.status,
    state: club.state ?? '',
    street_number: club.street_number ?? '',
    city: club.city ?? '',
    existingImages: club.images,
    clubImg: [],
  }
}

export function snapshotClubFormValues(values: ClubFormValues): string {
  return JSON.stringify({
    name: values.name,
    address: values.address,
    capacity: values.capacity,
    description: values.description,
    status: values.status,
    state: values.state,
    street_number: values.street_number,
    city: values.city,
    existingImageIds: [...values.existingImages.map((image) => image.documentId)].sort(),
    newImages: values.clubImg.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
  })
}
