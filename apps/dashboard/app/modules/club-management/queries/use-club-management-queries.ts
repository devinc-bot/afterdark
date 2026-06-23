import { queryOptions, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchClubs } from '~/modules/club-management/service/club-management.service'

export const clubsQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.clubs(),
    queryFn: fetchClubs,
  })

export function useClubs() {
  return useQuery(clubsQueryOptions())
}
