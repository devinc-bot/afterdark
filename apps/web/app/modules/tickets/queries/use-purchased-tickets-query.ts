import { useQuery } from '@tanstack/react-query'
import { fetchPurchasedTickets } from '../services/purchased-tickets.service'

export const PURCHASED_TICKETS_QUERY_KEY = ['purchased-tickets'] as const

export function usePurchasedTicketsQuery() {
  return useQuery({
    queryKey: PURCHASED_TICKETS_QUERY_KEY,
    queryFn: fetchPurchasedTickets,
  })
}
