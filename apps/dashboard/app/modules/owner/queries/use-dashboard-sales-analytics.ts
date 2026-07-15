import { useQuery } from '@tanstack/react-query'
import type { DashboardSalesAnalyticsQueryInput } from '@afterdark/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchDashboardSalesAnalytics } from '~/modules/owner/service/dashboard.service'

export function useDashboardSalesAnalytics(params: DashboardSalesAnalyticsQueryInput = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardSalesAnalytics(params),
    queryFn: () => fetchDashboardSalesAnalytics(params),
  })
}
