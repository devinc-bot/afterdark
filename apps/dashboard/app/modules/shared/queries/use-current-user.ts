import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { COOKIE_KEYS } from '~/modules/shared/constants/cookies'
import { QUERY_KEYS } from '~/modules/shared/constants/query-keys'
import { fetchCurrentUser } from '~/modules/shared/services/current-user.service'
import { getCookieSync } from '~/modules/shared/utils/cookies.utils'

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
