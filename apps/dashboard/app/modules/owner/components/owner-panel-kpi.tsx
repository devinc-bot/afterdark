import { useTranslation } from 'react-i18next'
import { formatCurrency, formatDateRange, formatNumber } from '@repo/common'
import type { DashboardKpiResponse } from '@repo/types'
import { KpiInformation as KpiCard, Skeleton } from '@repo/ui'
import { Banknote, CalendarCheck, Ticket } from 'lucide-react'

type OwnerPanelKpiProps = {
  data?: DashboardKpiResponse
  isLoading: boolean
  isError: boolean
}

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-9 w-20" />
      <Skeleton className="mt-3 h-4 w-40" />
    </div>
  )
}

export function OwnerPanelKpi({ data, isLoading, isError }: OwnerPanelKpiProps) {
  const { t, i18n } = useTranslation('dashboard')
  const locale = i18n.language === 'en' ? 'en-US' : 'es-AR'

  if (isError) {
    return (
      <p className="text-sm text-error" role="alert">
        {t('pages.panel.kpi.error')}
      </p>
    )
  }

  if (isLoading || !data) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label={t('pages.panel.kpi.ariaLabel')}
        aria-busy="true"
      >
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label={t('pages.panel.kpi.ariaLabel')}
    >
      <KpiCard
        variant="primary"
        label={t('pages.panel.kpi.publishedEvents')}
        value={formatNumber(data.publishedEventsCount, { locale })}
        icon={<CalendarCheck aria-hidden="true" />}
      />

      <KpiCard
        label={t('pages.panel.kpi.ticketsSold')}
        value={formatNumber(data.ticketsSoldCount, { locale })}
        icon={<Ticket aria-hidden="true" />}
      />

      <KpiCard
        label={t('pages.panel.kpi.totalRevenue')}
        value={formatCurrency(data.totalRevenue, {
          locale,
          options: { maximumFractionDigits: 0 },
        })}
        subtext={formatDateRange(data.revenueFromDate, data.revenueToDate, {
          locale,
          options: { day: 'numeric', month: 'short', year: 'numeric' },
        })}
        icon={<Banknote aria-hidden="true" />}
      />
    </div>
  )
}
