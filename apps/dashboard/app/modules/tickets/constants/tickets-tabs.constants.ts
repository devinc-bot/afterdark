import { TICKET_STATUS } from '@afterdark/types'

export const TICKET_TAB = {
  ACTIVE: TICKET_STATUS.ACTIVE,
  INACTIVE: TICKET_STATUS.INACTIVE,
} as const

export type TicketTab = (typeof TICKET_TAB)[keyof typeof TICKET_TAB]
