import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { LocationResponse } from '@afterdark/types'
import { Button } from '@afterdark/ui'
import { LOCATION_FORM_MODE } from '~/modules/locations/components/location-form'
import { LocationFormPage } from '~/modules/locations/components/location-form-page'
import { locationResponseToFormValues } from '~/modules/locations/utils/location-form.formatter'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { PageLayout } from '~/modules/common/components/page-layout'

type LocationEditViewProps = {
  location: LocationResponse
}

export function LocationEditView({ location }: LocationEditViewProps) {
  const { t } = useTranslation('locations')

  return (
    <LocationFormPage
      mode={LOCATION_FORM_MODE.EDIT}
      title={t('formPage.editTitle')}
      description={t('formPage.editDescription')}
      locationDocumentId={location.documentId}
      defaultValues={locationResponseToFormValues(location)}
    />
  )
}

export function LocationEditNotFoundView() {
  const { t } = useTranslation('locations')

  return (
    <PageLayout title={t('notFound.title')} description={t('notFound.description')}>
      <div>
        <Button asChild variant="outline">
          <Link to={DASHBOARD_ROUTES.locations()}>{t('formPage.back')}</Link>
        </Button>
      </div>
    </PageLayout>
  )
}
