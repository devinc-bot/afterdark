import type { AuthProvider } from '../enums/auth.ts'
import type { StaffStatus } from '../enums/staff.ts'
import { USER_ROLE, type OwnerStatus, type UserRole, type UserStatus } from '../enums/user.ts'

export interface SessionResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  role: UserRole
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
  organizationName: string | null
  taxId: string | null
  status: OwnerStatus
  address: CurrentUserAddress | null
}

export interface CurrentStaffResponse extends BaseProfileResponse {
  role: typeof USER_ROLE.STAFF
  phone: string
  status: StaffStatus
}

export interface CurrentUserResponse extends BaseProfileResponse {
  role: typeof USER_ROLE.USER
  phone: string
}

export type SettingsResponse = CurrentOwnerResponse | CurrentStaffResponse | CurrentUserResponse

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

export type AdminUserStatus = UserStatus | OwnerStatus | StaffStatus

/** Subset of AdminUserStatus the admin can assign via the status-change action. */
export type AdminUserTogglableStatus = Extract<AdminUserStatus, 'active' | 'inactive'>

export interface AdminUserListItemResponse {
  documentId: string
  email: string
  name: string | null
  lastName: string | null
  role: UserRole
  status: AdminUserStatus | null
  createdAt: string
}

export interface AdminUserDetailResponse {
  documentId: string
  email: string
  provider: AuthProvider
  role: UserRole
  createdAt: string
  name: string | null
  lastName: string | null
  phone: string | null
  birthday: string | null
  nationalId: string | null
  status: AdminUserStatus | null
  organizationName: string | null
  taxId: string | null
  address: CurrentUserAddress | null
}
