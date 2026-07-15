import type { DashboardKpiResponse } from '@afterdark/types'
import type { DashboardKpiQueryInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const DASHBOARD_KPI_ERROR =
  'No pudimos cargar los indicadores del panel. Intentá de nuevo en unos minutos.'

function dashboardApiPath(path: string) {
  return `${API_ROUTES.dashboard.prefix}${path}`
}

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
  const path = dashboardApiPath(API_ROUTES.dashboard.path.kpiDashboard())

  try {
    return await api.get<DashboardKpiResponse>(query.length > 0 ? `${path}?${query}` : path)
  } catch (error) {
    throw toApiServiceError(error, DASHBOARD_KPI_ERROR)
  }
}
