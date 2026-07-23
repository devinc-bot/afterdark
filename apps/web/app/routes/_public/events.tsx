import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@afterdark/ui'
import { EventsDiscoverPage } from '~/modules/events/components/events-discover-page'

export const Route = createFileRoute('/_public/events')({
  component: EventsPage,
})

function EventsPage() {
  usePageTitle('events', 'discover.page.metaTitle')

  return <EventsDiscoverPage />
}
