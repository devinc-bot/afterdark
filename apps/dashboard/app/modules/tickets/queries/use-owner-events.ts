import { useEvents } from '~/modules/events/queries/use-event-queries'

const OWNER_EVENTS_SELECT_LIMIT = 100

export function useOwnerEventsForSelect() {
  return useEvents({ page: 1, limit: OWNER_EVENTS_SELECT_LIMIT })
}
