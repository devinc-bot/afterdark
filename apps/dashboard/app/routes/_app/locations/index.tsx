import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RegisteredLocations } from '~/modules/locations/components/registered-locations'
import { PageLayout } from '~/modules/common/components/page-layout'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/_app/locations/')({
  component: LocationsPage,
})

function LocationsPage() {
  const { t } = useTranslation('locations')
  usePageTitle('locations', 'listPage.metaTitle')

  return (
    <PageLayout title={t('listPage.title')} description={t('listPage.description')}>
      <RegisteredLocations />
    </PageLayout>
  )
}
