import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RegisteredClubs } from '~/modules/club-management/components/registered-clubs'
import { PageLayout } from '~/modules/common/components/page-layout'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/_app/club-management/')({
  component: ClubManagementPage,
})

function ClubManagementPage() {
  const { t } = useTranslation('clubs')
  usePageTitle('clubs', 'listPage.metaTitle')

  return (
    <PageLayout title={t('listPage.title')} description={t('listPage.description')}>
      <RegisteredClubs />
    </PageLayout>
  )
}
