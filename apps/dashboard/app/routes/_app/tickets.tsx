import { createFileRoute } from '@tanstack/react-router'
import { TicketsManagementView } from '~/modules/tickets/components/tickets-management-view'
import { TICKETS_COPY } from '~/modules/tickets/constants/tickets.copy'

export const Route = createFileRoute('/_app/tickets')({
  head: () => ({ meta: [{ title: TICKETS_COPY.page.metaTitle }] }),
  component: TicketsPage,
})

function TicketsPage() {
  return <TicketsManagementView />
}
