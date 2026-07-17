import type { AddressSelect, ClubSelect } from '@afterdark/db/schema'
import type { ClubStatus } from '../enums/club.ts'

export type ClubWithAddress = {
  club: ClubSelect
  address: AddressSelect
}

export type ClubAddressInput = {
  address: string
  streetNumber: string
  state: string
  city: string
  latitude: number
  longitude: number
}

export type ClubUpsertInput = {
  name: string
  capacity: string
  description: string
  status: ClubStatus
} & ClubAddressInput
