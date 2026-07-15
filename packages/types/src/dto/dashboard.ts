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
