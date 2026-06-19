import { KpiInformation as KpiCard } from '@afterdark/ui'
import { Banknote, Ticket } from 'lucide-react'

export function KpiInformationTickets() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Indicadores de tickets"
    >
      <KpiCard
        variant="primary"
        label="Entradas vendidas totales"
        value="1.248.392"
        subtext={
          <>
            <Ticket aria-hidden="true" />
            +12% vs mes anterior
          </>
        }
      />

      <KpiCard
        label="Ingresos totales"
        value="US$ 14,2M"
        subtext={
          <>
            <Banknote aria-hidden="true" className="text-on-primary-container" />
            <span className="text-on-primary-container">Por encima del objetivo</span>
          </>
        }
      />
    </div>
  )
}
