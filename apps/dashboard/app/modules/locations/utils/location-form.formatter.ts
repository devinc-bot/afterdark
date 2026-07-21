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

export function buildCreateLocationFormData(values: LocationFormValues): FormData {
  const formData = new FormData()
  formData.append('name', values.name)
  formData.append('capacity', values.capacity)
  formData.append('description', values.description)
  formData.append('address', values.address)
  formData.append('street_number', values.street_number)
  formData.append('city', values.city)
  formData.append('state', values.state)
  formData.append('latitude', String(values.latitude))
  formData.append('longitude', String(values.longitude))

  for (const image of values.locationImg) {
    formData.append('images', image)
  }

  return formData
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
