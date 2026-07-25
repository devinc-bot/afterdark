import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  LocationEditErrorView,
  LocationEditLoadingView,
  LocationEditNotFoundView,
  LocationEditView,
} from '~/modules/locations/components/location-edit-view'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/_app/locations/$documentId/edit')({
  component: LocationEditPage,
})

function LocationEditPage() {
  const { documentId } = Route.useParams()
  const { t } = useTranslation('locations')
  const { data: locations, isLoading, isError, error, refetch, isFetching } = useLocations()
  usePageTitle('locations', 'formPage.editMetaTitle')

  if (isLoading) {
    return <LocationEditLoadingView />
  }

  if (isError) {
    return (
      <LocationEditErrorView
        message={error instanceof Error ? error.message : t('registry.loadErrorFallback')}
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  const location = locations?.find((item) => item.documentId === documentId)

  if (!location) {
    return <LocationEditNotFoundView />
  }

  return <LocationEditView location={location} />
}
