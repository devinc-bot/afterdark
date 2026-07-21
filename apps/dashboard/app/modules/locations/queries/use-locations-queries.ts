import { queryOptions, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchLocations } from '~/modules/locations/service/locations.service'

export const locationsQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.locations(),
    queryFn: fetchLocations,
  })

export function useLocations() {
  return useQuery(locationsQueryOptions())
}
