import { createFileRoute } from '@tanstack/react-router'
import { KpiInformationTickets } from '~/modules/tickets/components/kpi-information-tickets'
import { TicketRecords } from '~/modules/tickets/components/ticket-record'

export const Route = createFileRoute('/_app/tickets')({
  component: TicketsPage,
})

function TicketsPage() {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8">
        <header className="max-w-2xl">
          <h1 className="text-balance font-heading text-2xl font-bold text-ink sm:text-3xl">
            Gestión de tickets
          </h1>
          <p className="mt-2 text-pretty text-base text-ink-muted">
            Administrá los tipos de entrada, precios, disponibilidad y estado de venta por club.
          </p>
        </header>

        <KpiInformationTickets />

        <TicketRecords />
      </div>
    </main>
  )
}
