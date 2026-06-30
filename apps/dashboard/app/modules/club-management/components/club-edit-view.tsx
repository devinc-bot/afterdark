import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { ClubResponse } from '@afterdark/types'
import { Button } from '@afterdark/ui'
import { CLUB_FORM_MODE } from '~/modules/club-management/components/club-form'
import { ClubFormPage } from '~/modules/club-management/components/club-form-page'
import { clubResponseToFormValues } from '~/modules/club-management/utils/club-form.mapper'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { PageLayout } from '~/modules/common/components/page-layout'

type ClubEditViewProps = {
  club: ClubResponse
}

export function ClubEditView({ club }: ClubEditViewProps) {
  const { t } = useTranslation('clubs')

  return (
    <ClubFormPage
      mode={CLUB_FORM_MODE.EDIT}
      title={t('formPage.editTitle')}
      description={t('formPage.editDescription')}
      clubDocumentId={club.documentId}
      defaultValues={clubResponseToFormValues(club)}
    />
  )
}

export function ClubEditNotFoundView() {
  const { t } = useTranslation('clubs')

  return (
    <PageLayout title={t('notFound.title')} description={t('notFound.description')}>
      <div>
        <Button asChild variant="outline">
          <Link to={DASHBOARD_ROUTES.clubManagement()}>{t('formPage.back')}</Link>
        </Button>
      </div>
    </PageLayout>
  )
}
