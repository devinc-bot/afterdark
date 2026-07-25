import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { EventResponse } from '@repo/types'
import { EventFormPage } from '~/modules/events/components/event-form-page'
import { EVENT_FORM_MODE } from '~/modules/events/utils/event-form.types'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import {
  FormPageErrorState,
  FormPageLoadingState,
  FormPageNotFoundState,
  FormPageSectionSkeleton,
} from '~/modules/common/components/form-page-states'

type EventEditViewProps = {
  event: EventResponse
}

function useGoToEventsList() {
  const navigate = useNavigate()

  return useCallback(() => {
    void navigate({ to: DASHBOARD_ROUTES.events() })
  }, [navigate])
}

export function EventEditLoadingView() {
  const { t } = useTranslation('events')
  const goToList = useGoToEventsList()

  return (
    <FormPageLoadingState
      title={t('form.editTitle')}
      description={t('form.editDescription')}
      backLabel={t('form.back')}
      onBack={goToList}
      loadingLabel={t('form.loading')}
    >
      <FormPageSectionSkeleton />
    </FormPageLoadingState>
  )
}

type EventEditErrorViewProps = {
  message: string
  onRetry: () => void
  isRetrying?: boolean
}

export function EventEditErrorView({
  message,
  onRetry,
  isRetrying = false,
}: EventEditErrorViewProps) {
  const { t } = useTranslation('events')
  const goToList = useGoToEventsList()

  return (
    <FormPageErrorState
      title={t('form.editTitle')}
      description={t('form.editDescription')}
      backLabel={t('form.back')}
      onBack={goToList}
      errorTitle={t('form.loadErrorTitle')}
      message={message}
      retryLabel={t('form.retry')}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  )
}

export function EventEditNotFoundView() {
  const { t } = useTranslation('events')
  const goToList = useGoToEventsList()

  return (
    <FormPageNotFoundState
      title={t('form.notFoundTitle')}
      description={t('form.notFoundDescription')}
      backLabel={t('form.back')}
      onBack={goToList}
      actionLabel={t('form.back')}
    />
  )
}

export function EventEditView({ event }: EventEditViewProps) {
  const { t } = useTranslation('events')

  return (
    <EventFormPage
      mode={EVENT_FORM_MODE.EDIT}
      title={t('form.editTitle')}
      description={t('form.editDescription')}
      event={event}
    />
  )
}
