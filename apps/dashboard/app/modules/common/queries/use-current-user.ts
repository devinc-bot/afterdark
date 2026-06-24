import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchCurrentOwner } from '~/modules/common/services/owner.service'
import { getCookieSync } from '~/modules/common/utils/cookies.utils'

export const currentOwnerQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.currentUser(),
    queryFn: fetchCurrentOwner,
  })

export function useCurrentOwner() {
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null

  return useQuery({
    ...currentOwnerQueryOptions(),
    enabled: hasToken,
  })
}

export function useCurrentOwnerSuspense() {
  return useSuspenseQuery(currentOwnerQueryOptions())
}
