import { Link } from '@tanstack/react-router'
import type { ClubResponse } from '@afterdark/types'
import { Button } from '@afterdark/ui'
import { CLUB_FORM_MODE } from '~/modules/club-management/components/club-form'
import { ClubFormPage } from '~/modules/club-management/components/club-form-page'
import { CLUB_COPY } from '~/modules/club-management/constants/club.copy'
import { clubResponseToFormValues } from '~/modules/club-management/utils/club-form.mapper'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

type ClubEditPageProps = {
  club: ClubResponse
}

export function ClubEditPage({ club }: ClubEditPageProps) {
  return (
    <ClubFormPage
      mode={CLUB_FORM_MODE.EDIT}
      title={CLUB_COPY.formPage.editTitle}
      description={CLUB_COPY.formPage.editDescription}
      clubDocumentId={club.documentId}
      defaultValues={clubResponseToFormValues(club)}
    />
  )
}

export function ClubEditNotFound() {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">{CLUB_COPY.notFound.title}</h1>
        <p className="text-sm text-ink-muted">{CLUB_COPY.notFound.description}</p>
        <Button asChild variant="outline">
          <Link to={DASHBOARD_ROUTES.clubManagement()}>{CLUB_COPY.formPage.back}</Link>
        </Button>
      </div>
    </main>
  )
}
