import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteApiErrorRecord } from '~/modules/errors/service/errors.service'

const API_ERROR_RECORDS_BASE_KEY = ['api-error-records'] as const

export function useDeleteApiErrorRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteApiErrorRecord(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: API_ERROR_RECORDS_BASE_KEY })
    },
  })
}
