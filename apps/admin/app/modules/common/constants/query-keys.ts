export const QUERY_KEYS = {
  apiErrorRecords: (params?: Record<string, unknown>) =>
    ['api-error-records', params ?? {}] as const,
  adminUsers: (params?: Record<string, unknown>) => ['admin-users', params ?? {}] as const,
  adminUserDetail: (documentId?: string) => ['admin-user-detail', documentId ?? null] as const,
} as const
