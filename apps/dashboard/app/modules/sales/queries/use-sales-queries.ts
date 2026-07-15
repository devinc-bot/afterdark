import { useQuery } from '@tanstack/react-query'
import type { ListOwnerSalesQueryInput } from '@afterdark/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import {
  fetchOwnerSales,
  fetchSalesFilterClubs,
  fetchSalesFilterEvents,
} from '~/modules/sales/service/sales.service'

const DEFAULT_SALES_QUERY: ListOwnerSalesQueryInput = {
  page: 1,
  limit: 10,
}

export function useOwnerSales(params: Partial<ListOwnerSalesQueryInput> = {}) {
  const query = { ...DEFAULT_SALES_QUERY, ...params }

  return useQuery({
    queryKey: QUERY_KEYS.ownerSales({
      page: query.page,
      limit: query.limit,
      eventId: query.eventId,
      clubId: query.clubId,
      ticketType: query.ticketType,
      from: query.from?.toISOString(),
      to: query.to?.toISOString(),
    }),
    queryFn: () => fetchOwnerSales(query),
  })
}

export function useSalesFilterClubs() {
  return useQuery({
    queryKey: QUERY_KEYS.salesFilterClubs(),
    queryFn: fetchSalesFilterClubs,
  })
}

export function useSalesFilterEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.salesFilterEvents(),
    queryFn: fetchSalesFilterEvents,
  })
}
