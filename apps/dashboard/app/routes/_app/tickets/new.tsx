import { createFileRoute } from '@tanstack/react-router'
import { TicketCreateView } from '~/modules/tickets/components/ticket-create-view'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/_app/tickets/new')({
  component: TicketCreatePage,
})

function TicketCreatePage() {
  usePageTitle('tickets', 'createPage.metaTitle')

  return <TicketCreateView />
}
