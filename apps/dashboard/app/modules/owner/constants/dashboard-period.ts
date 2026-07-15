export const DASHBOARD_PERIOD = {
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  THIS_YEAR: 'this_year',
} as const

export type DashboardPeriod = (typeof DASHBOARD_PERIOD)[keyof typeof DASHBOARD_PERIOD]

export const DASHBOARD_PERIOD_OPTIONS = [
  DASHBOARD_PERIOD.THIS_WEEK,
  DASHBOARD_PERIOD.THIS_MONTH,
  DASHBOARD_PERIOD.THIS_YEAR,
] as const

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

/** Monday as first day of the week (ISO / es-AR). */
function startOfWeek(date: Date): Date {
  const start = startOfDay(date)
  const day = start.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - daysSinceMonday)
  return start
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  return endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6))
}

function startOfMonth(date: Date): Date {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function getDashboardPeriodRange(period: DashboardPeriod): {
  fromDate: Date
  toDate: Date
} {
  const now = new Date()
  const toDate = endOfDay(now)

  if (period === DASHBOARD_PERIOD.THIS_YEAR) {
    return {
      fromDate: startOfDay(new Date(now.getFullYear(), 0, 1)),
      toDate,
    }
  }

  if (period === DASHBOARD_PERIOD.THIS_MONTH) {
    return {
      fromDate: startOfMonth(now),
      toDate,
    }
  }

  return {
    fromDate: startOfWeek(now),
    toDate: endOfWeek(now),
  }
}
