import { useQuery } from '@tanstack/react-query'
import { PAYMENT_STATUS } from '@repo/types'
import { uuidSchema } from '@repo/validators'
import { getOrder } from '../services/checkout.service'

const ORDER_QUERY_REFETCH_INTERVAL = 3000

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: uuidSchema.safeParse(orderId).success,
    refetchInterval: (query) =>
      query.state.data?.status === PAYMENT_STATUS.PENDING ? ORDER_QUERY_REFETCH_INTERVAL : false,
  })
}
