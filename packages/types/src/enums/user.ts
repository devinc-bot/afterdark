export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  OWNER: 'owner',
  STAFF: 'staff',
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PRIVATE: 'private',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const OWNER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const

export type OwnerStatus = (typeof OWNER_STATUS)[keyof typeof OWNER_STATUS]

export const PROPERTY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type PropertyStatus = (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS]
