export const QUERY_KEYS = {
  apiErrorRecords: (params?: Record<string, unknown>) =>
    ['api-error-records', params ?? {}] as const,
} as const
