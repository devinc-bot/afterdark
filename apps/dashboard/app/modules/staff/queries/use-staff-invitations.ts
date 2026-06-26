import { queryOptions, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchStaffInvitations } from '~/modules/staff/services/staff-invitations.service'
import { mapStaffInvitationToRecord } from '~/modules/staff/utils/staff-invitations.mapper'

export const staffInvitationsQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.staffInvitations(),
    queryFn: async () => {
      const items = await fetchStaffInvitations()
      return items.map(mapStaffInvitationToRecord)
    },
  })

export function useStaffInvitations(enabled: boolean) {
  return useQuery({
    ...staffInvitationsQueryOptions(),
    enabled,
    throwOnError: false,
  })
}
