import type {
  AssetType,
  ClubStatus,
  OwnerStatus,
  StaffInvitationStatus,
  StaffStatus,
  UserRole,
} from './domain.ts'

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

export interface RegisterResponse {
  message: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
}

export interface SessionResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
}

export interface CurrentOwnerResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  status: OwnerStatus
}

/** @deprecated Use SessionResponse */
export type CurrentUserResponse = SessionResponse

export interface CurrentUserAddress {
  address: string
  streetNumber: string
  state: string
  city: string
}

export interface ClubImageResponse {
  documentId: string
  name: string
  url: string
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
  images: ClubImageResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateStaffInvitationResponse {
  documentId: string
  email: string
  clubId: string
  clubName: string
  invitedByOwnerId: string
  slug: string
  url: string
  expiresAt: Date
  hasSecurityWord: boolean
  status: StaffInvitationStatus
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

/** Public invitation data for the accept link flow (no auth). */
export interface StaffInvitationPublicResponse {
  documentId: string
  email: string
  clubId: string
  clubName: string
  slug: string
  expiresAt: Date
  hasSecurityWord: boolean
  /** Present when `hasSecurityWord`; used to verify the word before accept. */
  securityWordHash: string | null
}

export interface StaffPersonnelItem {
  documentId: string
  name: string
  email: string
  clubId: string
  clubName: string
  role: UserRole
  status: StaffStatus
  avatar: string | null
  lastActiveAt: Date
}

export interface UploadedAssetResponse {
  documentId: string
  name: string
  url: string
  type: AssetType
  createdAt: Date
  updatedAt: Date
}
