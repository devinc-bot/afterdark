import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  LocationEditNotFoundView,
  LocationEditView,
} from '~/modules/locations/components/location-edit-view'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/locations/$documentId/edit')({
  component: LocationEditPage,
})

function LocationEditPage() {
  const { documentId } = Route.useParams()
  const { t } = useTranslation('locations')
  const { data: locations, isLoading, isError, error } = useLocations()
  usePageTitle('locations', 'formPage.editMetaTitle')

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

  const location = locations?.find((item) => item.documentId === documentId)

  if (!location) {
    return <LocationEditNotFoundView />
  }

  return <LocationEditView location={location} />
}
