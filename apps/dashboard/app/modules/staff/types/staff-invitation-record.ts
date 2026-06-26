import { STAFF_INVITATION_STATUS, type StaffInvitationStatus } from '@afterdark/types'

export type StaffInvitationRecord = {
  id: string
  email: string
  clubId: string
  clubName: string
  url: string
  expiresAt: number
  createdAt: number
  hasSecurityWord: boolean
  status: StaffInvitationStatus
}

export function resolveStaffInvitationDisplayStatus(
  invitation: StaffInvitationRecord,
  now = Date.now()
): StaffInvitationStatus {
  if (invitation.status === STAFF_INVITATION_STATUS.ACCEPTED) {
    return STAFF_INVITATION_STATUS.ACCEPTED
  }

  if (invitation.status === STAFF_INVITATION_STATUS.CANCELLED) {
    return STAFF_INVITATION_STATUS.CANCELLED
  }

  if (invitation.status === STAFF_INVITATION_STATUS.EXPIRED || invitation.expiresAt <= now) {
    return STAFF_INVITATION_STATUS.EXPIRED
  }

  return STAFF_INVITATION_STATUS.PENDING
}

export function isStaffInvitationExpired(
  invitation: StaffInvitationRecord,
  now = Date.now()
): boolean {
  return resolveStaffInvitationDisplayStatus(invitation, now) === STAFF_INVITATION_STATUS.EXPIRED
}

export function canCopyStaffInvitationLink(status: StaffInvitationStatus): boolean {
  return status === STAFF_INVITATION_STATUS.PENDING || status === STAFF_INVITATION_STATUS.EXPIRED
}
