export const STAFF_TAB = {
  STAFF: 'staff',
  INVITATIONS: 'invitations',
} as const

export type StaffTab = (typeof STAFF_TAB)[keyof typeof STAFF_TAB]
