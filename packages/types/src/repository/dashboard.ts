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
