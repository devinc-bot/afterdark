import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { EventsDiscoverPage } from '~/modules/events/components/events-discover-page'

export const Route = createFileRoute('/_public/events/')({
  component: EventsIndexPage,
})

function EventsIndexPage() {
  usePageTitle('events', 'discover.page.metaTitle')

  return <EventsDiscoverPage />
}
