import type { DashboardKpiQueryInput } from '@repo/validators'

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function resolveDashboardRevenueDateRange(query: DashboardKpiQueryInput): {
  from: Date
  to: Date
} {
  const now = new Date()

  if (query.fromDate && query.toDate) {
    return { from: query.fromDate, to: endOfDay(query.toDate) }
  }

  if (query.fromDate) {
    return { from: query.fromDate, to: endOfMonth(query.fromDate) }
  }

  if (query.toDate) {
    return { from: startOfMonth(query.toDate), to: endOfDay(query.toDate) }
  }

  return { from: startOfMonth(now), to: endOfMonth(now) }
}
