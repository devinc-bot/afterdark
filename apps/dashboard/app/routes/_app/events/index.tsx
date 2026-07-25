import { createFileRoute } from '@tanstack/react-router'
import { EventsManagementView } from '~/modules/events/components/events-management-view'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/_app/events/')({
  component: EventsPage,
})

function EventsPage() {
  usePageTitle('events', 'page.metaTitle')

  return <EventsManagementView />
}
