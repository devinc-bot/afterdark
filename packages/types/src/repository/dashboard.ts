import type { TicketType } from '../enums/ticket.ts'

export type FindDashboardKpiParams = {
  ownerDocumentId: string
  revenueFromDate: Date
  revenueToDate: Date
}

export type DashboardKpiRow = {
  publishedEventsCount: number
  ticketsSoldCount: number
  totalRevenue: number
}

export type FindDashboardTicketsSoldSeriesParams = {
  ownerDocumentId: string
  fromDate: Date
  toDate: Date
  granularity: 'day' | 'month'
}

export type ListOwnerSalesParams = {
  ownerDocumentId: string
  page: number
  limit: number
  eventDocumentId?: string
  locationDocumentId?: string
  ticketType?: TicketType
  from?: Date
  to?: Date
}

export type OwnerSaleRow = {
  orderDocumentId: string
  buyerName: string
  buyerLastName: string
  buyerEmail: string
  eventName: string
  ticketName: string
  ticketType: TicketType
  locationName: string
  paidAt: Date | null
  quantity: number
  amount: number
  status: string
}

export type PaginatedOwnerSalesResult = {
  rows: OwnerSaleRow[]
  total: number
}
