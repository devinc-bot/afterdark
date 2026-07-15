import type { DashboardKpiResponse } from '@afterdark/types'
import type { DashboardKpiQueryInput } from '@afterdark/validators'
import { buildApiPath, toApiServiceError } from '@afterdark/common'
import { api, API_ROUTES } from '~/config/api'

const DASHBOARD_KPI_ERROR =
  'No pudimos cargar los indicadores del panel. Intentá de nuevo en unos minutos.'

export async function fetchDashboardKpi(
  params: DashboardKpiQueryInput = {}
): Promise<DashboardKpiResponse> {
  const searchParams = new URLSearchParams()

  if (params.fromDate) {
    searchParams.set('fromDate', params.fromDate.toISOString())
  }

  if (params.toDate) {
    searchParams.set('toDate', params.toDate.toISOString())
  }

  const query = searchParams.toString()
  const path = buildApiPath(API_ROUTES.dashboard, API_ROUTES.dashboard.path.kpiDashboard())

  try {
    return await api.get<DashboardKpiResponse>(query.length > 0 ? `${path}?${query}` : path)
  } catch (error) {
    throw toApiServiceError(error, DASHBOARD_KPI_ERROR)
  }
}
