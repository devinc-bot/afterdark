import { queryOptions, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchStaffInvitationByLink } from '~/modules/staff/services/staff-invitations.service'

export function staffInvitationByLinkQueryOptions(slug: string, token: string) {
  return queryOptions({
    queryKey: QUERY_KEYS.staffInvitationLink(slug, token),
    queryFn: () => fetchStaffInvitationByLink(slug, token),
    retry: false,
  })
}

export function useStaffInvitationByLink(slug: string, token: string) {
  return useQuery({
    ...staffInvitationByLinkQueryOptions(slug, token),
    throwOnError: false,
  })
}
