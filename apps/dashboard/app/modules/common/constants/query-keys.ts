export const QUERY_KEYS = {
  settings: () => ['settings'] as const,
  locations: () => ['locations'] as const,
  staffPersonnel: () => ['staff-personnel'] as const,
  staffInvitations: () => ['staff-invitations'] as const,
  tickets: (params?: { page?: number; limit?: number; status?: string }) =>
    ['tickets', params ?? {}] as const,
  ticket: (documentId: string) => ['ticket', documentId] as const,
  scannedTicketsHistory: (params: { eventId: string; page: number; limit: number }) =>
    ['scanned-tickets-history', params] as const,
  events: (params?: { page?: number; limit?: number; hasSales?: boolean }) =>
    ['events', params ?? {}] as const,
  event: (documentId: string) => ['event', documentId] as const,
  ownerSales: (params?: Record<string, unknown>) => ['owner-sales', params ?? {}] as const,
  salesFilterLocations: () => ['sales-filter-locations'] as const,
  salesFilterEvents: () => ['sales-filter-events'] as const,
  dashboardKpi: (params?: { fromDate?: Date; toDate?: Date }) =>
    [
      'dashboard-kpi',
      {
        fromDate: params?.fromDate?.toISOString(),
        toDate: params?.toDate?.toISOString(),
      },
    ] as const,
  dashboardSalesAnalytics: (params?: { fromDate?: Date; toDate?: Date }) =>
    [
      'dashboard-sales-analytics',
      {
        fromDate: params?.fromDate?.toISOString(),
        toDate: params?.toDate?.toISOString(),
      },
    ] as const,
  staffInvitationLink: (slug: string, token: string) =>
    ['staff-invitation-link', slug, token] as const,
} as const
