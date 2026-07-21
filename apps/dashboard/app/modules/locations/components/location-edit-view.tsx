import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { LocationResponse } from '@afterdark/types'
import { Button, Skeleton } from '@afterdark/ui'
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

const PAGE_CONTAINER_CLASS = 'mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8'

export function LocationEditLoadingView() {
  return (
    <div className={PAGE_CONTAINER_CLASS} aria-busy="true">
      <div className="mb-8 flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {[0, 1].map((row) => (
          <div
            key={row}
            className="grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LocationEditErrorView({ message }: { message?: string }) {
  const { t } = useTranslation('locations')

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-xl border border-error/30 bg-error-container/20 px-6 py-12 text-center">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-base font-semibold text-ink">
            {t('registry.loadErrorTitle')}
          </p>
          <p className="text-sm text-ink-muted">{message ?? t('registry.loadErrorFallback')}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={DASHBOARD_ROUTES.locations()}>{t('formPage.back')}</Link>
        </Button>
      </div>
    </div>
  )
}
