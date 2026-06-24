import type { StaffInvitationResult } from '~/modules/staff/components/staff-user-form'
import { staffInvitationRequiresSecurityWord } from '~/modules/staff/utils/staff-invitation.utils'

export type StaffInvitationRecord = {
  id: string
  email: string
  clubId: string
  clubName: string
  url: string
  expiresAt: number
  createdAt: number
  hasSecurityWord: boolean
}

export function createStaffInvitationRecord({
  record,
  invitation,
}: StaffInvitationResult): StaffInvitationRecord {
  return {
    id: record.id,
    email: record.email,
    clubId: record.clubId,
    clubName: record.clubName,
    url: invitation.url,
    expiresAt: invitation.expiresAt,
    createdAt: Date.now(),
    hasSecurityWord: staffInvitationRequiresSecurityWord(invitation.payload),
  }
}

export function isStaffInvitationExpired(
  invitation: StaffInvitationRecord,
  now = Date.now()
): boolean {
  return invitation.expiresAt <= now
}
