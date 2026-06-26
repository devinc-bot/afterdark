import { CLUB_FORM_MODE } from '~/modules/club-management/components/club-form'
import { ClubFormPage } from '~/modules/club-management/components/club-form-page'
import { CLUB_COPY } from '~/modules/club-management/constants/club.copy'

export function ClubCreatePage() {
  return (
    <ClubFormPage
      mode={CLUB_FORM_MODE.CREATE}
      title={CLUB_COPY.formPage.createTitle}
      description={CLUB_COPY.formPage.createDescription}
    />
  )
}
