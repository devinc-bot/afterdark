import { useQuery } from '@tanstack/react-query'
import type { ListEventsQueryInput } from '@afterdark/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchEvents } from '~/modules/events/service/events.service'

const DEFAULT_EVENTS_QUERY: ListEventsQueryInput = {
  page: 1,
  limit: 10,
}

export function useEvents(params: Partial<ListEventsQueryInput> = {}) {
  const query = { ...DEFAULT_EVENTS_QUERY, ...params }

  return useQuery({
    queryKey: QUERY_KEYS.events(query),
    queryFn: () => fetchEvents(query),
  })
}
