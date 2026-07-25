import { useQuery } from '@tanstack/react-query'
import type { ListEventsQueryInput } from '@repo/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchEvent, fetchEvents } from '~/modules/events/service/events.service'

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

export function useEvent(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.event(documentId),
    queryFn: () => fetchEvent(documentId),
    enabled: Boolean(documentId),
  })
}
