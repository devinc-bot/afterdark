import { createFileRoute } from '@tanstack/react-router'
import ticketsEs from '@afterdark/i18n/locales/tickets/es.json'
import { TicketsManagementView } from '~/modules/tickets/components/tickets-management-view'

export const Route = createFileRoute('/_app/tickets')({
  head: () => ({ meta: [{ title: ticketsEs.page.metaTitle }] }),
  component: TicketsPage,
})

function TicketsPage() {
  return <TicketsManagementView />
}
