import { KpiInformation as KpiCard } from '@afterdark/ui'
import { Banknote, CalendarCheck, CircleAlert, TrendingUp } from 'lucide-react'

export function KpiInformation() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Indicadores de clubes"
    >
      <KpiCard
        variant="primary"
        label="Clubes totales"
        value="24"
        subtext={
          <>
            <TrendingUp aria-hidden="true" />
            +3 este mes
          </>
        }
      />

      <KpiCard
        label="Entradas activas"
        value="1.842"
        subtext={
          <>
            <CalendarCheck aria-hidden="true" className="text-primary" />
            <span className="text-primary">Sesiones en curso</span>
          </>
        }
      />

      <KpiCard
        label="Ingresos (24 h)"
        value="€12,5k"
        subtext={
          <>
            <Banknote aria-hidden="true" className="text-on-primary-container" />
            <span className="text-on-primary-container">Por encima de ayer</span>
          </>
        }
      />

      <KpiCard
        label="Verificaciones pendientes"
        value="02"
        subtext={
          <>
            <CircleAlert aria-hidden="true" className="text-error" />
            <span className="text-error">Requieren atención</span>
          </>
        }
      />
    </div>
  )
}
