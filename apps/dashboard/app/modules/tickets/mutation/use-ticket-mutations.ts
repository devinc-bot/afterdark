import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTicketInput, UpdateTicketInput } from '@afterdark/validators'
import { createTicket, deleteTicket, updateTicket } from '~/modules/tickets/service/tickets.service'

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

type UpdateTicketVariables = {
  documentId: string
  input: UpdateTicketInput
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, input }: UpdateTicketVariables) => updateTicket(documentId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useDeleteTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteTicket(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
