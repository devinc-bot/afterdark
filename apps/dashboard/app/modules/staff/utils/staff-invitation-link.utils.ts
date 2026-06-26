import { QueryFactoryError } from '~/modules/common/utils/query-factory'
import {
  STAFF_INVITATION_VALIDATION_REASON,
  type StaffInvitationValidationReason,
} from '~/modules/staff/constants/staff-invitation.constants'

export function mapStaffInvitationLinkError(error: unknown): StaffInvitationValidationReason {
  if (error instanceof QueryFactoryError) {
    if (error.status === 410) {
      return STAFF_INVITATION_VALIDATION_REASON.EXPIRED
    }

    if (error.status === 400) {
      return STAFF_INVITATION_VALIDATION_REASON.SLUG_MISMATCH
    }
  }

  return STAFF_INVITATION_VALIDATION_REASON.INVALID
}

export async function verifyStaffInvitationSecurityWordHash(
  securityWordHash: string | null,
  securityWord: string
): Promise<boolean> {
  if (!securityWordHash) return true

  const data = new TextEncoder().encode(securityWord)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const digest = Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')

  return digest === securityWordHash
}
