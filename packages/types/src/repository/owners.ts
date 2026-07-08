import type { OwnerStatus } from '../enums/user.ts'

export type OwnerAddressRow = {
  address: string
  streetNumber: string
  state: string
  city: string
}

export type OwnerProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

export type OwnerProfileSeed = {
  name: string
  lastName: string
  phone: string
}

export type CurrentOwnerRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  status: OwnerStatus
  email: string
  address: OwnerAddressRow | null
}

export type OwnerUpdateInput = {
  name: string
  lastName: string
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
}

export type InviterOwnerRow = {
  id: number
  documentId: string
  role: string
}
