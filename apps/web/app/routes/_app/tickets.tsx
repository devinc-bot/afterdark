import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { MyTicketsPage } from '~/modules/tickets/components/my-tickets-page'

export const Route = createFileRoute('/_app/tickets')({
  component: TicketsRoute,
})

function TicketsRoute() {
  usePageTitle('tickets', 'mine.page.metaTitle')

  return <MyTicketsPage />
}
