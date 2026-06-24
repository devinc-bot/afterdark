export const TICKET_TAB = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export type TicketTab = (typeof TICKET_TAB)[keyof typeof TICKET_TAB]
