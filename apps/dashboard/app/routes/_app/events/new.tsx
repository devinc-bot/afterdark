import { createFileRoute } from '@tanstack/react-router'
import { EventWizardCreateView } from '~/modules/events/components/event-wizard-create-view'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/events/new')({
  component: EventCreatePage,
})

function EventCreatePage() {
  usePageTitle('events', 'wizard.createMetaTitle')

  return <EventWizardCreateView />
}
