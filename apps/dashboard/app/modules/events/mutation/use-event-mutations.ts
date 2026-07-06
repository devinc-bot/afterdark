import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateEventInput, UpdateEventInput } from '@afterdark/validators'
import { createEvent, deleteEvent, updateEvent } from '~/modules/events/service/events.service'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

type UpdateEventVariables = {
  documentId: string
  input: UpdateEventInput
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, input }: UpdateEventVariables) => updateEvent(documentId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteEvent(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
