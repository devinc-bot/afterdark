import type { CreateStaffInvitationResponse } from '@afterdark/types'
import type { StaffInvitationRecord } from '~/modules/staff/types/staff-invitation-record'

export function mapStaffInvitationToRecord(
  item: CreateStaffInvitationResponse
): StaffInvitationRecord {
  return {
    id: item.documentId,
    email: item.email,
    clubId: item.clubId,
    clubName: item.clubName,
    url: item.url,
    expiresAt: new Date(item.expiresAt).getTime(),
    createdAt: new Date(item.createdAt).getTime(),
    hasSecurityWord: item.hasSecurityWord,
    status: item.status,
  }
}
