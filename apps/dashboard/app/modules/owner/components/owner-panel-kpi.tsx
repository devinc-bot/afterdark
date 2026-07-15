import { useTranslation } from 'react-i18next'
import type { DashboardKpiResponse } from '@afterdark/types'
import { KpiInformation as KpiCard, Skeleton } from '@afterdark/ui'
import { Banknote, CalendarCheck, Ticket } from 'lucide-react'

type OwnerPanelKpiProps = {
  data?: DashboardKpiResponse
  isLoading: boolean
  isError: boolean
}

function formatCount(value: number, locale: string): string {
  return value.toLocaleString(locale === 'en' ? 'en-US' : 'es-AR')
}

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateRange(from: string, to: string, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`
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
  const locale = i18n.language

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
        value={formatCount(data.publishedEventsCount, locale)}
        icon={<CalendarCheck aria-hidden="true" />}
      />

      <KpiCard
        label={t('pages.panel.kpi.ticketsSold')}
        value={formatCount(data.ticketsSoldCount, locale)}
        icon={<Ticket aria-hidden="true" />}
      />

      <KpiCard
        label={t('pages.panel.kpi.totalRevenue')}
        value={formatCurrency(data.totalRevenue, locale)}
        subtext={formatDateRange(data.revenueFromDate, data.revenueToDate, locale)}
        icon={<Banknote aria-hidden="true" />}
      />
    </div>
  )
}
