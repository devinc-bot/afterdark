export const ATTENDEE_ENTRY_STATUS = {
  VALID: 'valid',
  USED: 'used',
  EXPIRED: 'expired',
} as const

export type AttendeeEntryStatus = (typeof ATTENDEE_ENTRY_STATUS)[keyof typeof ATTENDEE_ENTRY_STATUS]
