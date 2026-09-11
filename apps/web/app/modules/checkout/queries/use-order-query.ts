import { useQuery } from '@tanstack/react-query'
import { uuidSchema } from '@repo/validators'
import { getOrder } from '../services/checkout.service'

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: uuidSchema.safeParse(orderId).success,
  })
}
