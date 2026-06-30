import { useTranslation } from 'react-i18next'
import { CLUB_FORM_MODE } from '~/modules/club-management/components/club-form'
import { ClubFormPage } from '~/modules/club-management/components/club-form-page'

export function ClubCreatePage() {
  const { t } = useTranslation('clubs')

  return (
    <ClubFormPage
      mode={CLUB_FORM_MODE.CREATE}
      title={t('formPage.createTitle')}
      description={t('formPage.createDescription')}
    />
  )
}
