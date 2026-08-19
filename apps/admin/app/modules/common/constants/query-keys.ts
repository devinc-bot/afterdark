export const QUERY_KEYS = {
  apiErrorRecords: (params?: Record<string, unknown>) =>
    ['api-error-records', params ?? {}] as const,
  adminUsers: (params?: Record<string, unknown>) => ['admin-users', params ?? {}] as const,
} as const
