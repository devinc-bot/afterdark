import { PAYMENT_STATUS, type OrderResponse } from '@repo/types'

const ORDER_QUERY_REFETCH_INTERVAL = 3000

export function getOrderRefetchInterval(
  status: OrderResponse['status'] | undefined,
  isStreamActive: boolean
): number | false {
  return status === PAYMENT_STATUS.PENDING && !isStreamActive ? ORDER_QUERY_REFETCH_INTERVAL : false
}
