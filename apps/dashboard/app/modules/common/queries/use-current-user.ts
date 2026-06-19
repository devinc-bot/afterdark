import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchCurrentUser } from '~/modules/common/services/current-user.service'
import { getCookieSync } from '~/modules/common/utils/cookies.utils'

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.currentUser(),
    queryFn: fetchCurrentUser,
  })

export function useCurrentUser() {
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null

  return useQuery({
    ...currentUserQueryOptions(),
    enabled: hasToken,
  })
}

export function useCurrentUserSuspense() {
  return useSuspenseQuery(currentUserQueryOptions())
}
