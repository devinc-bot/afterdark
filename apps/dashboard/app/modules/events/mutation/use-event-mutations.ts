import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateEventInput, UpdateEventInput } from '@afterdark/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { createEvent, deleteEvent, updateEvent } from '~/modules/events/service/events.service'

type CreateEventVariables = {
  input: CreateEventInput
  images: File[]
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, images }: CreateEventVariables) => createEvent(input, images),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

type UpdateEventVariables = {
  documentId: string
  input: UpdateEventInput
  keepImageIds: string[]
  newImages: File[]
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, input, keepImageIds, newImages }: UpdateEventVariables) =>
      updateEvent(documentId, input, keepImageIds, newImages),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.event(variables.documentId) }),
      ])
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
