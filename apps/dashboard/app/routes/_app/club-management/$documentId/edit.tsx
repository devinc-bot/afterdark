import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClubEditNotFoundView,
  ClubEditView,
} from '~/modules/club-management/components/club-edit-view'
import { useClubs } from '~/modules/club-management/queries/use-club-management-queries'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/club-management/$documentId/edit')({
  component: ClubEditPage,
})

function ClubEditPage() {
  const { documentId } = Route.useParams()
  const { t } = useTranslation('clubs')
  const { data: clubs, isLoading, isError, error } = useClubs()
  usePageTitle('clubs', 'formPage.editMetaTitle')

  if (isLoading) {
    return (
      <div className="rounded-xl border border-hairline bg-surface-container-low px-6 py-12 text-center">
        <p className="text-sm text-ink-muted">{t('registry.loading')}</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed border-error/40 bg-error-container/20 px-6 py-12 text-center">
        <p className="font-heading text-base font-semibold text-ink">
          {t('registry.loadErrorTitle')}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          {error instanceof Error ? error.message : t('registry.loadErrorFallback')}
        </p>
      </div>
    )
  }

  const club = clubs?.find((item) => item.documentId === documentId)

  if (!club) {
    return <ClubEditNotFoundView />
  }

  return <ClubEditView club={club} />
}
