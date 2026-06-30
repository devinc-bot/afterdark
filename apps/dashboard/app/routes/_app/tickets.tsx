import { createFileRoute } from '@tanstack/react-router'
import { TicketsManagementView } from '~/modules/tickets/components/tickets-management-view'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/_app/tickets')({
  component: TicketsPage,
})

function TicketsPage() {
  usePageTitle('tickets', 'page.metaTitle')

  return <TicketsManagementView />
}
