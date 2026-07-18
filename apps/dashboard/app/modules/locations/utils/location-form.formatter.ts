import type { LocationResponse } from '@afterdark/types'
import type { LocationFormValues } from '~/modules/locations/components/location-form'
import type { RegisteredLocation } from '~/modules/locations/components/registered-location-records'

export function locationResponseToFormValues(
  location: LocationResponse
): Partial<LocationFormValues> {
  return {
    name: location.name,
    address: location.address,
    capacity: location.capacity,
    description: location.description ?? '',
    state: location.state,
    street_number: location.streetNumber,
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
    existingImages: location.images,
    locationImg: [],
  }
}

export function registeredLocationToFormValues(
  location: RegisteredLocation
): Partial<LocationFormValues> {
  return {
    name: location.name,
    address: location.address,
    capacity: location.capacity ?? '',
    description: location.description ?? '',
    state: location.state ?? '',
    street_number: location.street_number ?? '',
    city: location.city ?? '',
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
    existingImages: location.images,
    locationImg: [],
  }
}

export function snapshotLocationFormValues(values: LocationFormValues): string {
  return JSON.stringify({
    name: values.name,
    address: values.address,
    capacity: values.capacity,
    description: values.description,
    state: values.state,
    street_number: values.street_number,
    city: values.city,
    latitude: values.latitude,
    longitude: values.longitude,
    existingImageIds: [...values.existingImages.map((image) => image.documentId)].sort(),
    newImages: values.locationImg.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
  })
}
