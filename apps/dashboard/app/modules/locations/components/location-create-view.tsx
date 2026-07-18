import { useTranslation } from 'react-i18next'
import { LOCATION_FORM_MODE } from '~/modules/locations/components/location-form'
import { LocationFormPage } from '~/modules/locations/components/location-form-page'

export function LocationCreateView() {
  const { t } = useTranslation('locations')

  return (
    <LocationFormPage
      mode={LOCATION_FORM_MODE.CREATE}
      title={t('formPage.createTitle')}
      description={t('formPage.createDescription')}
    />
  )
}
