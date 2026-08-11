import { useQuery } from '@tanstack/react-query'
import {
  fetchOrders,
  ORDERS_FIRST_PAGE,
  ORDERS_PAGE_SIZE,
  type FetchOrdersParams,
} from '../services/orders.service'

export const ORDERS_QUERY_KEY = ['orders'] as const

export function useOrdersQuery(params: FetchOrdersParams = {}) {
  const page = params.page ?? ORDERS_FIRST_PAGE
  const limit = params.limit ?? ORDERS_PAGE_SIZE

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, { page, limit }],
    queryFn: () => fetchOrders({ page, limit }),
  })
}
