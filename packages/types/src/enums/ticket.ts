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
