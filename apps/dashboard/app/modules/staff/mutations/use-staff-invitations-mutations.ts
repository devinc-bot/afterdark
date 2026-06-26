import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { deleteStaffInvitation } from '~/modules/staff/services/staff-invitations.service'

export function useDeleteStaffInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteStaffInvitation(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffInvitations() })
    },
  })
}
