import type { StaffInvitationStatus, StaffStatus } from '../enums/staff.ts'
import type { UserRole } from '../enums/user.ts'

export interface CreateStaffInvitationResponse {
  documentId: string
  email: string
  organizationId: string
  organizationName: string
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
  organizationId: string
  organizationName: string
  slug: string
  expiresAt: Date
  hasSecurityWord: boolean
}

export interface StaffPersonnelItem {
  documentId: string
  name: string
  email: string
  organizationId: string
  organizationName: string
  role: UserRole
  status: StaffStatus
  avatar: string | null
  lastActiveAt: Date
}
