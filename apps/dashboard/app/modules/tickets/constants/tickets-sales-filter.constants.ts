export const TICKET_SALES_FILTER_OPTION = {
  ALL: 'all',
  SOLD: 'sold',
  UNSOLD: 'unsold',
} as const

export type TicketSalesFilterOption =
  (typeof TICKET_SALES_FILTER_OPTION)[keyof typeof TICKET_SALES_FILTER_OPTION]

export const TICKET_SALES_FILTER_OPTIONS = [
  TICKET_SALES_FILTER_OPTION.ALL,
  TICKET_SALES_FILTER_OPTION.SOLD,
  TICKET_SALES_FILTER_OPTION.UNSOLD,
] as const
