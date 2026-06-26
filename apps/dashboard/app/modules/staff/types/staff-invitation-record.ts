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

export function canCopyStaffInvitationLink(
  invitation: StaffInvitationRecord,
  now = Date.now()
): boolean {
  return resolveStaffInvitationDisplayStatus(invitation, now) === STAFF_INVITATION_STATUS.PENDING
}

export function canDeleteStaffInvitation(
  invitation: StaffInvitationRecord,
  now = Date.now()
): boolean {
  const displayStatus = resolveStaffInvitationDisplayStatus(invitation, now)
  return (
    displayStatus === STAFF_INVITATION_STATUS.PENDING ||
    displayStatus === STAFF_INVITATION_STATUS.EXPIRED
  )
}
