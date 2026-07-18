import type { PaymentStatus } from '../enums/payment.ts'
import type { TicketType } from '../enums/ticket.ts'

export type DashboardSeriesGranularity = 'day' | 'month'

export type DashboardTicketsSoldSeriesPoint = {
  periodKey: string
  ticketsSoldCount: number
}

export type DashboardKpiResponse = {
  publishedEventsCount: number
  ticketsSoldCount: number
  totalRevenue: number
  revenueFromDate: string
  revenueToDate: string
}

export type DashboardSalesAnalyticsResponse = {
  fromDate: string
  toDate: string
  seriesGranularity: DashboardSeriesGranularity
  ticketsSoldSeries: DashboardTicketsSoldSeriesPoint[]
}

export type OwnerSaleResponse = {
  id: string
  buyerName: string
  buyerEmail: string
  eventName: string
  ticketName: string
  ticketType: TicketType
  locationName: string
  paidAt: string | null
  quantity: number
  amount: number
  status: PaymentStatus
}
