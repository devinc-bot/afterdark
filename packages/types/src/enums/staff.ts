export const STAFF_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type StaffStatus = (typeof STAFF_STATUS)[keyof typeof STAFF_STATUS]

export const STAFF_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const

export type StaffInvitationStatus =
  (typeof STAFF_INVITATION_STATUS)[keyof typeof STAFF_INVITATION_STATUS]
