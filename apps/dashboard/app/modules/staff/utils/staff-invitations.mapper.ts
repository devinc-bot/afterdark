import type { CreateStaffInvitationResponse } from '@repo/types'
import type { StaffInvitationRecord } from '~/modules/staff/types/staff-invitation-record'

export function mapStaffInvitationToRecord(
  item: CreateStaffInvitationResponse
): StaffInvitationRecord {
  return {
    id: item.documentId,
    email: item.email,
    organizationId: item.organizationId,
    organizationName: item.organizationName,
    url: item.url,
    expiresAt: new Date(item.expiresAt).getTime(),
    createdAt: new Date(item.createdAt).getTime(),
    hasSecurityWord: item.hasSecurityWord,
    status: item.status,
  }
}
