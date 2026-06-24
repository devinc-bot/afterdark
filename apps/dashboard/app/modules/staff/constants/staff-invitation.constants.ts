export const STAFF_INVITATION_VALIDATION_REASON = {
  INVALID: 'invalid',
  EXPIRED: 'expired',
  SLUG_MISMATCH: 'slug_mismatch',
} as const

export type StaffInvitationValidationReason =
  (typeof STAFF_INVITATION_VALIDATION_REASON)[keyof typeof STAFF_INVITATION_VALIDATION_REASON]
