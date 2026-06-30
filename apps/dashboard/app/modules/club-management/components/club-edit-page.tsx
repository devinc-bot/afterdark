import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { ClubResponse } from '@afterdark/types'
import { Button } from '@afterdark/ui'
import { CLUB_FORM_MODE } from '~/modules/club-management/components/club-form'
import { ClubFormPage } from '~/modules/club-management/components/club-form-page'
import { clubResponseToFormValues } from '~/modules/club-management/utils/club-form.mapper'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

type ClubEditPageProps = {
  club: ClubResponse
}

export function ClubEditPage({ club }: ClubEditPageProps) {
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

export function ClubEditNotFound() {
  const { t } = useTranslation('clubs')

  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">{t('notFound.title')}</h1>
        <p className="text-sm text-ink-muted">{t('notFound.description')}</p>
        <Button asChild variant="outline">
          <Link to={DASHBOARD_ROUTES.clubManagement()}>{t('formPage.back')}</Link>
        </Button>
      </div>
    </main>
  )
}
