import type { StaffStatus } from '../enums/staff.ts'
import { USER_ROLE, type OwnerStatus, type PropertyStatus, type UserRole } from '../enums/user.ts'

export interface SessionResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
}

export interface BaseProfileResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  role: UserRole
}

export interface CurrentOwnerResponse extends BaseProfileResponse {
  role: typeof USER_ROLE.OWNER
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  status: OwnerStatus
  address: CurrentUserAddress | null
}

export interface CurrentStaffResponse extends BaseProfileResponse {
  role: typeof USER_ROLE.STAFF
  phone: string
  status: StaffStatus
}

export type SettingsResponse = CurrentOwnerResponse | CurrentStaffResponse

export interface CurrentUserAddress {
  address: string
  streetNumber: string
  state: string
  city: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

/** @deprecated Placeholder del catálogo legacy en `web`; eliminar con el módulo `properties`. */
export interface Property {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  status: PropertyStatus
  createdAt: Date
  updatedAt: Date
}
