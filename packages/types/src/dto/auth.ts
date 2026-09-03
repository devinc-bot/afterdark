import type { AccountSessionStatus, ClientApp } from '../enums/auth.ts'
import type { UserRole } from '../enums/user.ts'

export const SESSION_METADATA_FIELD_LIMITS = {
  device: 255,
  userAgent: 512,
} as const

export interface LoginResponse {
  accessToken: string
}

export interface RegisterResponse {
  message: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  sessionDocumentId: string
}

export interface RefreshSessionRequest {
  app: ClientApp
}

export interface LogoutSessionRequest {
  app: ClientApp
}

export interface SessionMetadata {
  ipAddress: string | null
  device: string | null
  userAgent: string | null
  locationLabel: string | null
  city: string | null
  state: string | null
  country: string | null
}

export interface AccountSessionResponse {
  documentId: string
  clientApp: ClientApp
  device: string | null
  ipAddress: string | null
  locationLabel: string | null
  createdAt: Date
  expiresAt: Date
  revokedAt: Date | null
  status: AccountSessionStatus
  isCurrent: boolean
}

export interface AccountSessionsResponse {
  sessions: AccountSessionResponse[]
}
