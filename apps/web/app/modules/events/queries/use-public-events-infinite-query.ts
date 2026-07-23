import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPublicEvents, PUBLIC_EVENTS_PAGE_SIZE } from '../services/public-events.service'
import {
  toPublicEventsFilterParams,
  type EventsDiscoverFiltersValue,
} from '../utils/events-discover-filters'

export const publicEventsQueryKey = (filters: EventsDiscoverFiltersValue) =>
  ['public-events', toPublicEventsFilterParams(filters)] as const

export function usePublicEventsInfiniteQuery(filters: EventsDiscoverFiltersValue) {
  const filterParams = toPublicEventsFilterParams(filters)

  return useInfiniteQuery({
    queryKey: publicEventsQueryKey(filters),
    queryFn: ({ pageParam }) =>
      fetchPublicEvents({
        ...filterParams,
        page: pageParam,
        limit: PUBLIC_EVENTS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })
}
