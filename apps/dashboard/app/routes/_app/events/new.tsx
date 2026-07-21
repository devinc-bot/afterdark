import { createFileRoute } from '@tanstack/react-router'
import { EventCreateView } from '~/modules/events/components/event-create-view'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/events/new')({
  component: EventCreatePage,
})

function EventCreatePage() {
  usePageTitle('events', 'form.createMetaTitle')

  return <EventCreateView />
}
