import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@repo/common'
import type { DashboardSalesAnalyticsResponse, DashboardSeriesGranularity } from '@repo/types'
import { BarChart, Skeleton } from '@repo/ui'
import { DASHBOARD_PERIOD, type DashboardPeriod } from '~/modules/owner/constants/dashboard-period'

type OwnerPanelChartProps = {
  period: DashboardPeriod
  data?: DashboardSalesAnalyticsResponse
  isLoading: boolean
  isError: boolean
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-6 h-56 w-full" />
    </div>
  )
}

function capitalizeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/\.$/, '')
}

function formatWeekdayLabel(periodKey: string, locale: string): string {
  const [year, month, day] = periodKey.split('-').map(Number)
  if (!year || !month || !day) return periodKey

  const weekday = formatDate(new Date(year, month - 1, day), {
    locale: locale === 'en' ? 'en-US' : 'es-AR',
    options: { weekday: 'long' },
  })

  return capitalizeLabel(weekday)
}

function formatSeriesLabel(params: {
  periodKey: string
  index: number
  granularity: DashboardSeriesGranularity
  period: DashboardPeriod
  locale: string
  dayLabel: (day: number) => string
}): string {
  const { periodKey, index, granularity, period, locale, dayLabel } = params

  if (granularity === 'day' && period === DASHBOARD_PERIOD.THIS_WEEK) {
    return formatWeekdayLabel(periodKey, locale)
  }

  if (granularity === 'day') {
    return dayLabel(index + 1)
  }

  const [year, month] = periodKey.split('-').map(Number)
  if (!year || !month) return periodKey

  const monthLabel = formatDate(new Date(year, month - 1, 1), {
    locale: locale === 'en' ? 'en-US' : 'es-AR',
    options: { month: 'short' },
  })

  return capitalizeLabel(monthLabel)
}

export function OwnerPanelChart({ period, data, isLoading, isError }: OwnerPanelChartProps) {
  const { t, i18n } = useTranslation('dashboard')
  const locale = i18n.language
  const isDaySeries = data?.seriesGranularity === 'day'
  const isWeekPeriod = period === DASHBOARD_PERIOD.THIS_WEEK

  const chartData = useMemo(() => {
    if (!data) return []

    return data.ticketsSoldSeries.map((point, index) => ({
      label: formatSeriesLabel({
        periodKey: point.periodKey,
        index,
        granularity: data.seriesGranularity,
        period,
        locale,
        dayLabel: (day) => t('pages.panel.chart.dayLabel', { day }),
      }),
      ticketsSold: point.ticketsSoldCount,
    }))
  }, [data, locale, period, t])

  if (isError) {
    return (
      <p className="text-sm text-error" role="alert">
        {t('pages.panel.chart.error')}
      </p>
    )
  }

  if (isLoading || !data) {
    return <ChartSkeleton />
  }

  return (
    <BarChart
      data={chartData}
      config={{
        ticketsSold: {
          label: t('pages.panel.kpi.ticketsSold'),
          color: 'var(--color-chart-1)',
        },
      }}
      categoryKey="label"
      series={['ticketsSold']}
      title={t('pages.panel.chart.title')}
      description={
        isDaySeries
          ? t('pages.panel.chart.descriptionDays')
          : t('pages.panel.chart.descriptionMonths')
      }
      showYAxis
      yAxisAllowDecimals={false}
      barRadius={isDaySeries ? 4 : 8}
      chartClassName="aspect-auto h-72"
      xAxisInterval={isWeekPeriod ? 0 : isDaySeries ? 'preserveStartEnd' : 0}
      xAxisMinTickGap={isWeekPeriod ? 8 : isDaySeries ? 40 : 8}
    />
  )
}
