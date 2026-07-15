import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  usePageTitle,
} from '@afterdark/ui'
import { PageLayout } from '~/modules/common/components/page-layout'
import { OwnerPanelChart } from '~/modules/owner/components/owner-panel-chart'
import { OwnerPanelKpi } from '~/modules/owner/components/owner-panel-kpi'
import {
  DASHBOARD_PERIOD,
  DASHBOARD_PERIOD_OPTIONS,
  getDashboardPeriodRange,
  type DashboardPeriod,
} from '~/modules/owner/constants/dashboard-period'
import { useDashboardKpi } from '~/modules/owner/queries/use-dashboard-kpi'
import { useDashboardSalesAnalytics } from '~/modules/owner/queries/use-dashboard-sales-analytics'

function isDashboardPeriod(value: string): value is DashboardPeriod {
  return DASHBOARD_PERIOD_OPTIONS.includes(value as DashboardPeriod)
}

export function OwnerPanelView() {
  const { t } = useTranslation('dashboard')
  const [period, setPeriod] = useState<DashboardPeriod>(DASHBOARD_PERIOD.THIS_MONTH)
  const range = useMemo(() => getDashboardPeriodRange(period), [period])
  const kpiQuery = useDashboardKpi(range)
  const salesQuery = useDashboardSalesAnalytics(range)

  usePageTitle('dashboard', 'pages.panel.metaTitle')

  return (
    <PageLayout title={t('pages.panel.title')} description={t('pages.panel.description')}>
      <div className="flex flex-col gap-6">
        <OwnerPanelKpi
          data={kpiQuery.data}
          isLoading={kpiQuery.isLoading}
          isError={kpiQuery.isError}
        />

        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Select
              value={period}
              onValueChange={(value) => {
                if (isDashboardPeriod(value)) {
                  setPeriod(value)
                }
              }}
            >
              <SelectTrigger
                className="w-full sm:w-52"
                aria-label={t('pages.panel.period.ariaLabel')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DASHBOARD_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`pages.panel.period.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <OwnerPanelChart
            period={period}
            data={salesQuery.data}
            isLoading={salesQuery.isLoading}
            isError={salesQuery.isError}
          />
        </div>
      </div>
    </PageLayout>
  )
}
