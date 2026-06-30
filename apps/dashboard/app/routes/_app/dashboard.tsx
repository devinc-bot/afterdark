import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '~/modules/common/components/page-layout'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  usePageTitle('dashboard', 'pages.panel.metaTitle')

  return <PageLayout title={t('pages.panel.title')} description={t('pages.panel.description')} />
}
