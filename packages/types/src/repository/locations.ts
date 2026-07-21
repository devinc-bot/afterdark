import type { AddressSelect, LocationSelect } from '@afterdark/db/schema'
import type { LocationType } from '../enums/location.ts'

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
  type: LocationType
} & LocationAddressInput
