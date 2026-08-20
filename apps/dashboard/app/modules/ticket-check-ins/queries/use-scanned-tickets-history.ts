import { useQuery } from '@tanstack/react-query'
import type { ListScannedTicketsQueryInput } from '@repo/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchScannedTicketsHistory } from '../services/ticket-check-ins.service'

export function useScannedTicketsHistory(params: Partial<ListScannedTicketsQueryInput> = {}) {
  const query: ListScannedTicketsQueryInput = {
    eventId: params.eventId ?? '',
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  }

  return useQuery({
    queryKey: QUERY_KEYS.scannedTicketsHistory(query),
    queryFn: () => fetchScannedTicketsHistory(query),
    enabled: Boolean(params.eventId),
  })
}
