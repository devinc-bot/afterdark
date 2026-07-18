import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import {
  createLocation,
  deleteLocation,
  updateLocation,
} from '~/modules/locations/service/locations.service'

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => createLocation(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.locations() })
    },
  })
}

type UpdateLocationVariables = {
  documentId: string
  formData: FormData
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, formData }: UpdateLocationVariables) =>
      updateLocation(documentId, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.locations() })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteLocation(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.locations() })
    },
  })
}
