export declare const USER_ROLE: {
  readonly USER: 'user'
  readonly ADMIN: 'admin'
  readonly OWNER: 'owner'
  readonly STAFF: 'staff'
}
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]
export declare const USER_STATUS: {
  readonly ACTIVE: 'active'
  readonly INACTIVE: 'inactive'
  readonly PRIVATE: 'private'
}
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]
export declare const ASSET_TYPE: {
  readonly IMG: 'img'
  readonly VIDEO: 'video'
}
export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE]
export declare const USER_ASSET_LINK_TYPE: {
  readonly POST: 'post'
  readonly HISTORY: 'history'
}
export type UserAssetLinkType = (typeof USER_ASSET_LINK_TYPE)[keyof typeof USER_ASSET_LINK_TYPE]
export declare const CLUB_STATUS: {
  readonly ACTIVE: 'active'
  readonly INACTIVE: 'inactive'
}
export type ClubStatus = (typeof CLUB_STATUS)[keyof typeof CLUB_STATUS]
export declare const TICKET_STATUS: {
  readonly ACTIVE: 'active'
  readonly INACTIVE: 'inactive'
}
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]
export declare const TICKET_TYPE: {
  readonly GENERAL: 'general'
  readonly VIP: 'vip'
}
export type TicketType = (typeof TICKET_TYPE)[keyof typeof TICKET_TYPE]
export declare const PAYMENT_STATUS: {
  readonly COMPLETED: 'completed'
  readonly PENDING: 'pending'
  readonly REJECTED: 'rejected'
  readonly CANCELLED: 'cancelled'
}
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
export declare const PROPERTY_STATUS: {
  readonly ACTIVE: 'active'
  readonly INACTIVE: 'inactive'
}
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
