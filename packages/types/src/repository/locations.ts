import type { AddressSelect, LocationSelect } from '@repo/db/schema'

export type LocationWithAddress = {
  location: LocationSelect
  address: AddressSelect
}

export type LocationAddressInput = {
  address: string
  streetNumber: string
  state: string
  city: string
  latitude: number
  longitude: number
}

export type LocationUpsertInput = {
  name: string
  capacity: string
  description: string
} & LocationAddressInput
