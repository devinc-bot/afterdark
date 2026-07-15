import { useTranslation } from 'react-i18next'
import { PageLayout } from '~/modules/common/components/page-layout'
import { usePageTitle } from '@afterdark/ui'
import { OwnerPanelKpi } from '~/modules/owner/components/owner-panel-kpi'
import { useDashboardKpi } from '~/modules/owner/queries/use-dashboard-kpi'

export function OwnerPanelView() {
  const { t } = useTranslation('dashboard')
  const { data, isLoading, isError } = useDashboardKpi()
  usePageTitle('dashboard', 'pages.panel.metaTitle')

  return (
    <PageLayout title={t('pages.panel.title')} description={t('pages.panel.description')}>
      <OwnerPanelKpi data={data} isLoading={isLoading} isError={isError} />
    </PageLayout>
  )
}
