import { queryOptions, useQuery } from '@tanstack/react-query'
import { getCookieSync } from '@repo/common'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { getMyProfile } from '~/modules/settings/services/profile.service'

export const PROFILE_QUERY_KEY = ['web-profile'] as const

export const profileQueryOptions = () =>
  queryOptions({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  })

export function useProfile() {
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null

  return useQuery({
    ...profileQueryOptions(),
    enabled: hasToken,
  })
}
