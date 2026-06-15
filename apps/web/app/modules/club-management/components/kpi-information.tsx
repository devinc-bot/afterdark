import { KpiInformation as KpiCard } from '@afterdark/ui'
import { Banknote, CalendarCheck, CircleAlert, TrendingUp } from 'lucide-react'

export function KpiInformation() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        variant="primary"
        label="Total Clubs"
        value="24"
        subtext={
          <>
            <TrendingUp aria-hidden="true" />
            +3 this month
          </>
        }
      />

      <KpiCard
        label="Live Tickets"
        value="1,842"
        subtext={
          <>
            <CalendarCheck aria-hidden="true" className="text-primary" />
            <span className="text-primary">Active sessions</span>
          </>
        }
      />

      <KpiCard
        label="Revenue (24h)"
        value="€12.5k"
        subtext={
          <>
            <Banknote aria-hidden="true" className="text-on-primary-container" />
            <span className="text-on-primary-container">Beat yesterday</span>
          </>
        }
      />

      <KpiCard
        label="Pending Verif."
        value="02"
        subtext={
          <>
            <CircleAlert aria-hidden="true" className="text-error" />
            <span className="text-error">Urgent attention</span>
          </>
        }
      />
    </div>
  )
}
