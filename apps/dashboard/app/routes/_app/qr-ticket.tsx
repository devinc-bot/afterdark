import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { TicketCheckInPage } from '~/modules/ticket-check-ins/components/ticket-check-in-page'

export const Route = createFileRoute('/_app/qr-ticket')({
  component: QrTicketPage,
})

function QrTicketPage() {
  usePageTitle('dashboard', 'pages.qrTicket.metaTitle')

  return <TicketCheckInPage />
}
