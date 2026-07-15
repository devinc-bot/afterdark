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
