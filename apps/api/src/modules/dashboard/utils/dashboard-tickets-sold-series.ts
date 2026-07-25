import type { DashboardSeriesGranularity, DashboardTicketsSoldSeriesPoint } from '@repo/types'

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function resolveDashboardSeriesGranularity(
  from: Date,
  to: Date
): DashboardSeriesGranularity {
  const dayMs = 24 * 60 * 60 * 1000
  const spanDays = Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayMs) + 1
  return spanDays > 60 ? 'month' : 'day'
}

export function fillDashboardTicketsSoldSeries(params: {
  from: Date
  to: Date
  granularity: DashboardSeriesGranularity
  rows: DashboardTicketsSoldSeriesPoint[]
}): DashboardTicketsSoldSeriesPoint[] {
  const { from, to, granularity, rows } = params
  const byKey = new Map(rows.map((row) => [row.periodKey, row.ticketsSoldCount]))

  if (granularity === 'day') {
    const series: DashboardTicketsSoldSeriesPoint[] = []
    const cursor = startOfDay(from)
    const end = startOfDay(to)

    while (cursor.getTime() <= end.getTime()) {
      const periodKey = formatDayKey(cursor)
      series.push({
        periodKey,
        ticketsSoldCount: byKey.get(periodKey) ?? 0,
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return series
  }

  const series: DashboardTicketsSoldSeriesPoint[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)

  while (cursor.getTime() <= end.getTime()) {
    const periodKey = formatMonthKey(cursor)
    series.push({
      periodKey,
      ticketsSoldCount: byKey.get(periodKey) ?? 0,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return series
}
