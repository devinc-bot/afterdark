import { useQuery } from '@tanstack/react-query'
import { uuidSchema } from '@repo/validators'
import { useOrderStream } from '../hooks/use-order-stream'
import { getOrder } from '../services/checkout.service'
import { getOrderRefetchInterval } from './order-polling'

export function useOrderQuery(orderId: string) {
  const { isStreamActive } = useOrderStream(orderId)
  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: uuidSchema.safeParse(orderId).success,
    refetchInterval: (currentQuery) => {
      return getOrderRefetchInterval(currentQuery.state.data?.status, isStreamActive)
    },
  })

  return { ...query, isStreamActive }
}
