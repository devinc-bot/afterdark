import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { LocationResponse } from '@afterdark/types'
import { LOCATION_FORM_MODE } from '~/modules/locations/components/location-form'
import { LocationFormPage } from '~/modules/locations/components/location-form-page'
import { locationResponseToFormValues } from '~/modules/locations/utils/location-form.formatter'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import {
  FormPageErrorState,
  FormPageLoadingState,
  FormPageNotFoundState,
  FormPageSectionSkeleton,
} from '~/modules/common/components/form-page-states'

type LocationEditViewProps = {
  location: LocationResponse
}

function useGoToLocationsList() {
  const navigate = useNavigate()

  return useCallback(() => {
    void navigate({ to: DASHBOARD_ROUTES.locations() })
  }, [navigate])
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
  const goToList = useGoToLocationsList()

  return (
    <FormPageNotFoundState
      title={t('notFound.title')}
      description={t('notFound.description')}
      backLabel={t('formPage.back')}
      onBack={goToList}
      actionLabel={t('formPage.back')}
    />
  )
}

export function LocationEditLoadingView() {
  const { t } = useTranslation('locations')
  const goToList = useGoToLocationsList()

  return (
    <FormPageLoadingState
      title={t('formPage.editTitle')}
      description={t('formPage.editDescription')}
      backLabel={t('formPage.back')}
      onBack={goToList}
      loadingLabel={t('registry.loading')}
    >
      <FormPageSectionSkeleton />
    </FormPageLoadingState>
  )
}

type LocationEditErrorViewProps = {
  message?: string
  onRetry: () => void
  isRetrying?: boolean
}

export function LocationEditErrorView({
  message,
  onRetry,
  isRetrying = false,
}: LocationEditErrorViewProps) {
  const { t } = useTranslation('locations')
  const goToList = useGoToLocationsList()

  return (
    <FormPageErrorState
      title={t('formPage.editTitle')}
      description={t('formPage.editDescription')}
      backLabel={t('formPage.back')}
      onBack={goToList}
      errorTitle={t('registry.loadErrorTitle')}
      message={message ?? t('registry.loadErrorFallback')}
      retryLabel={t('registry.retry')}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  )
}
