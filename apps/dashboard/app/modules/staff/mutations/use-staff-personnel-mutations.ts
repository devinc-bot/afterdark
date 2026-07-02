import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { StaffStatus } from '@afterdark/types'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import {
  deleteStaffUser,
  updateStaffUserStatus,
} from '~/modules/staff/services/staff-personnel.service'

export function useDeleteStaffUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteStaffUser(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffPersonnel() })
    },
  })
}

export function useUpdateStaffUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, status }: { documentId: string; status: StaffStatus }) =>
      updateStaffUserStatus(documentId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffPersonnel() })
    },
  })
}
