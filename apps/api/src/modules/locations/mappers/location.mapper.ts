import type { AddressSelect, AssetSelect, LocationSelect } from '@repo/db'
import type { LocationImageResponse, LocationResponse } from '@repo/types'
import type { CreateLocationInput, UpdateLocationInput } from '@repo/validators'

export function toLocationImageResponse(asset: AssetSelect): LocationImageResponse {
  return {
    documentId: asset.documentId,
    name: asset.name,
    url: asset.url ?? '',
  }
}

export function toLocationResponse(
  location: LocationSelect,
  address: AddressSelect,
  images: LocationImageResponse[] = []
): LocationResponse {
  return {
    documentId: location.documentId,
    name: location.name,
    capacity: location.capacity,
    description: location.description,
    address: address.address,
    streetNumber: address.streetNumber,
    state: address.state,
    city: address.city,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    images,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
  }
}

export function toLocationUpsertInput(input: CreateLocationInput | UpdateLocationInput) {
  return {
    name: input.name,
    capacity: input.capacity,
    description: input.description,
    address: input.address,
    streetNumber: input.street_number,
    state: input.state,
    city: input.city,
    latitude: input.latitude,
    longitude: input.longitude,
  }
}

export function groupLocationImagesByLocationId(
  imageRows: { locationId: number; asset: AssetSelect }[]
): Map<number, LocationImageResponse[]> {
  const map = new Map<number, LocationImageResponse[]>()

  for (const { locationId, asset } of imageRows) {
    const images = map.get(locationId) ?? []
    images.push(toLocationImageResponse(asset))
    map.set(locationId, images)
  }

  return map
}
