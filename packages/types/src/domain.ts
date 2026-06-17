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

export const ASSET_TYPE = {
  IMG: 'img',
  VIDEO: 'video',
} as const

export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE]

export const USER_ASSET_LINK_TYPE = {
  POST: 'post',
  HISTORY: 'history',
} as const

export type UserAssetLinkType = (typeof USER_ASSET_LINK_TYPE)[keyof typeof USER_ASSET_LINK_TYPE]

export const CLUB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type ClubStatus = (typeof CLUB_STATUS)[keyof typeof CLUB_STATUS]

export const TICKET_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]

export const TICKET_TYPE = {
  GENERAL: 'general',
  VIP: 'vip',
} as const

export type TicketType = (typeof TICKET_TYPE)[keyof typeof TICKET_TYPE]

export const PAYMENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export const PROPERTY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type PropertyStatus = (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS]

export interface Property {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  status: PropertyStatus
  createdAt: Date
  updatedAt: Date
}
