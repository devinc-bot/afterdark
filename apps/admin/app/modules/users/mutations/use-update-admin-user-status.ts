import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminUserTogglableStatus } from '@repo/types'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { updateAdminUserStatus } from '~/modules/users/service/users.service'

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      status,
    }: {
      documentId: string
      status: AdminUserTogglableStatus
    }) => updateAdminUserStatus(documentId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers() })
    },
  })
}
