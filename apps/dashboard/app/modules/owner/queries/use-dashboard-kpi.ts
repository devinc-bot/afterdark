import { useQuery } from '@tanstack/react-query'
import type { DashboardKpiQueryInput } from '@afterdark/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchDashboardKpi } from '~/modules/owner/service/dashboard.service'

export function useDashboardKpi(params: DashboardKpiQueryInput = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardKpi(params),
    queryFn: () => fetchDashboardKpi(params),
  })
}
