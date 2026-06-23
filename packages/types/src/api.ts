import type { ClubStatus, StaffInvitationStatus, UserRole } from './domain.ts'

export interface ApiResponse<T> {
  data: T
  success: true
}

export interface ApiError {
  message: string
  code: string
  success: false
}

export interface LoginResponse {
  accessToken: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
}

export interface CurrentUserAddress {
  address: string
  streetNumber: string
  state: string
  city: string
}

export interface CurrentUserResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  address: CurrentUserAddress | null
}

export interface ClubResponse {
  documentId: string
  name: string
  capacity: string
  description: string | null
  status: ClubStatus
  address: string
  streetNumber: string
  state: string
  city: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateStaffInvitationResponse {
  documentId: string
  email: string
  clubId: string
  clubName: string
  invitedByUserId: string
  slug: string
  url: string
  expiresAt: Date
  hasSecurityWord: boolean
  status: StaffInvitationStatus
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
