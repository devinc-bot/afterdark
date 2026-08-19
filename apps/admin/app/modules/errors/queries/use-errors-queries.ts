import { useQuery } from '@tanstack/react-query'
import type { ListApiErrorRecordsQueryInput } from '@repo/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchApiErrorRecords } from '~/modules/errors/service/errors.service'

const DEFAULT_ERRORS_QUERY: ListApiErrorRecordsQueryInput = {
  page: 1,
  limit: 10,
}

export function useApiErrorRecords(params: Partial<ListApiErrorRecordsQueryInput> = {}) {
  const query = { ...DEFAULT_ERRORS_QUERY, ...params }

  return useQuery({
    queryKey: QUERY_KEYS.apiErrorRecords({
      page: query.page,
      limit: query.limit,
      statusCode: query.statusCode,
      path: query.path,
      from: query.from?.toISOString(),
      to: query.to?.toISOString(),
    }),
    queryFn: () => fetchApiErrorRecords(query),
  })
}
