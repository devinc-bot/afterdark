import type { DashboardKpiResponse, DashboardSalesAnalyticsResponse } from '@afterdark/types'
import type {
  DashboardKpiQueryInput,
  DashboardSalesAnalyticsQueryInput,
} from '@afterdark/validators'
import { buildApiPath, toApiServiceError } from '@afterdark/common'
import { api, API_ROUTES } from '~/config/api'

const DASHBOARD_KPI_ERROR =
  'No pudimos cargar los indicadores del panel. Intentá de nuevo en unos minutos.'

const DASHBOARD_SALES_ANALYTICS_ERROR =
  'No pudimos cargar el gráfico de ventas. Intentá de nuevo en unos minutos.'

function toSearchParams(params: { fromDate?: Date; toDate?: Date }): string {
  const searchParams = new URLSearchParams()

  if (params.fromDate) {
    searchParams.set('fromDate', params.fromDate.toISOString())
  }

  if (params.toDate) {
    searchParams.set('toDate', params.toDate.toISOString())
  }

  return searchParams.toString()
}

export async function fetchDashboardKpi(
  params: DashboardKpiQueryInput = {}
): Promise<DashboardKpiResponse> {
  const query = toSearchParams(params)
  const path = buildApiPath(API_ROUTES.dashboard, API_ROUTES.dashboard.path.kpiDashboard())

  try {
    return await api.get<DashboardKpiResponse>(query.length > 0 ? `${path}?${query}` : path)
  } catch (error) {
    throw toApiServiceError(error, DASHBOARD_KPI_ERROR)
  }
}

export async function fetchDashboardSalesAnalytics(
  params: DashboardSalesAnalyticsQueryInput = {}
): Promise<DashboardSalesAnalyticsResponse> {
  const query = toSearchParams(params)
  const path = buildApiPath(API_ROUTES.dashboard, API_ROUTES.dashboard.path.salesAnalytics())

  try {
    return await api.get<DashboardSalesAnalyticsResponse>(
      query.length > 0 ? `${path}?${query}` : path
    )
  } catch (error) {
    throw toApiServiceError(error, DASHBOARD_SALES_ANALYTICS_ERROR)
  }
}
