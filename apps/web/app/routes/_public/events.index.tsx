import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { EventsDiscoverPage } from '~/modules/events/components/events-discover-page'
import { parseEventsDiscoverSearch } from '~/modules/events/utils/events-discover-filters'

export const Route = createFileRoute('/_public/events/')({
  validateSearch: parseEventsDiscoverSearch,
  component: EventsIndexPage,
})

function EventsIndexPage() {
  usePageTitle('events', 'discover.page.metaTitle')

  return <EventsDiscoverPage />
}
