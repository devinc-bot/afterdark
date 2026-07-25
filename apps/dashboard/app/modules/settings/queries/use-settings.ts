import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { getCookieSync } from '@repo/common'
import { fetchSettings } from '~/modules/settings/services/settings.service'

export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.settings(),
    queryFn: fetchSettings,
  })

export function useSettings() {
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null

  return useQuery({
    ...settingsQueryOptions(),
    enabled: hasToken,
  })
}

export function useSettingsSuspense() {
  return useSuspenseQuery(settingsQueryOptions())
}
