import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTicketTypeInput } from '@repo/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { createTicketType } from '~/modules/ticket-types/service/ticket-types.service'

export function useCreateTicketType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTicketTypeInput) => createTicketType(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticketTypes() })
    },
  })
}
