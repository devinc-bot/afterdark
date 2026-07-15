export const QUERY_KEYS = {
  settings: () => ['settings'] as const,
  clubs: () => ['clubs'] as const,
  staffPersonnel: () => ['staff-personnel'] as const,
  staffInvitations: () => ['staff-invitations'] as const,
  tickets: (params?: { page?: number; limit?: number; status?: string }) =>
    ['tickets', params ?? {}] as const,
  events: (params?: { page?: number; limit?: number }) => ['events', params ?? {}] as const,
  dashboardKpi: (params?: { fromDate?: Date; toDate?: Date }) =>
    ['dashboard-kpi', params ?? {}] as const,
  staffInvitationLink: (slug: string, token: string) =>
    ['staff-invitation-link', slug, token] as const,
} as const
