export const ADMIN_USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const

export type AdminUserStatusValue = (typeof ADMIN_USER_STATUS)[keyof typeof ADMIN_USER_STATUS]
