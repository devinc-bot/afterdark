import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import {
  createClub,
  deleteClub,
  updateClub,
} from '~/modules/club-management/service/club-management.service'

export function useCreateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => createClub(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clubs() })
    },
  })
}

type UpdateClubVariables = {
  documentId: string
  formData: FormData
}

export function useUpdateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, formData }: UpdateClubVariables) => updateClub(documentId, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clubs() })
    },
  })
}

export function useDeleteClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteClub(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clubs() })
    },
  })
}
