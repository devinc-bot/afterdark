import { useQuery } from '@tanstack/react-query'
import {
  fetchPurchasedTickets,
  PURCHASED_TICKETS_FIRST_PAGE,
  PURCHASED_TICKETS_PAGE_SIZE,
  type FetchPurchasedTicketsParams,
} from '../services/purchased-tickets.service'

export const PURCHASED_TICKETS_QUERY_KEY = ['purchased-tickets'] as const

export function usePurchasedTicketsQuery(params: FetchPurchasedTicketsParams = {}) {
  const page = params.page ?? PURCHASED_TICKETS_FIRST_PAGE
  const limit = params.limit ?? PURCHASED_TICKETS_PAGE_SIZE

  return useQuery({
    queryKey: [...PURCHASED_TICKETS_QUERY_KEY, { page, limit }],
    queryFn: () => fetchPurchasedTickets({ page, limit }),
  })
}
