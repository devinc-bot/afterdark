import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteOrder } from '../services/orders.service'
import { ORDERS_QUERY_KEY } from '../queries/use-orders-query'

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
    },
  })
}
