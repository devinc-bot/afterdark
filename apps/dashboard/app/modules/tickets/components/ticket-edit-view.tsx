import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { TicketResponse } from '@repo/types'
import { FormPageActions } from '~/modules/common/components/form-page-actions'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { FormPageLayout } from '~/modules/common/components/form-page-layout'
import {
  FormPageErrorState,
  FormPageLoadingState,
  FormPageNotFoundState,
  FormPageSectionSkeleton,
} from '~/modules/common/components/form-page-states'
import {
  TICKET_FORM_MODE,
  TicketForm,
  TicketFormSubmitButton,
} from '~/modules/tickets/components/ticket-form'
import { ticketResponseToFormValues } from '~/modules/tickets/utils/ticket-form.formatter'

type TicketEditViewProps = {
  ticket: TicketResponse
}

function useGoToTicketsList() {
  const navigate = useNavigate()

  return useCallback(() => {
    void navigate({ to: DASHBOARD_ROUTES.tickets() })
  }, [navigate])
}

export function TicketEditLoadingView() {
  const { t } = useTranslation('tickets')
  const goToList = useGoToTicketsList()

  return (
    <FormPageLoadingState
      title={t('editPage.title')}
      description={t('editPage.description')}
      backLabel={t('editPage.back')}
      onBack={goToList}
      loadingLabel={t('editPage.loading')}
    >
      <FormPageSectionSkeleton />
    </FormPageLoadingState>
  )
}

type TicketEditErrorViewProps = {
  message: string
  onRetry: () => void
  isRetrying?: boolean
}

export function TicketEditErrorView({
  message,
  onRetry,
  isRetrying = false,
}: TicketEditErrorViewProps) {
  const { t } = useTranslation('tickets')
  const goToList = useGoToTicketsList()

  return (
    <FormPageErrorState
      title={t('editPage.title')}
      description={t('editPage.description')}
      backLabel={t('editPage.back')}
      onBack={goToList}
      errorTitle={t('editPage.loadErrorTitle')}
      message={message}
      retryLabel={t('editPage.retry')}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  )
}

export function TicketEditNotFoundView() {
  const { t } = useTranslation('tickets')
  const goToList = useGoToTicketsList()

  return (
    <FormPageNotFoundState
      title={t('editPage.notFoundTitle')}
      description={t('editPage.notFoundDescription')}
      backLabel={t('editPage.back')}
      onBack={goToList}
      actionLabel={t('editPage.back')}
    />
  )
}

export function TicketEditView({ ticket }: TicketEditViewProps) {
  const { t } = useTranslation('tickets')
  const { t: tCommon } = useTranslation('common')
  const goToList = useGoToTicketsList()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  return (
    <FormPageLayout
      title={t('editPage.title')}
      description={t('editPage.description')}
      backLabel={t('editPage.back')}
      onBack={goToList}
      footer={
        <FormPageActions
          isDirty={isDirty}
          isSaving={isSubmitting}
          dirtyLabel={tCommon('formActions.dirty')}
          cleanLabel={tCommon('formActions.clean')}
          cancelLabel={t('form.cancel')}
          onCancel={goToList}
          cancelDisabled={isSubmitting}
        >
          <TicketFormSubmitButton
            mode={TICKET_FORM_MODE.EDIT}
            isSubmitting={isSubmitting}
            disabled={!isDirty}
            variant={isDirty ? 'default' : 'outline'}
          />
        </FormPageActions>
      }
    >
      <TicketForm
        key={ticket.documentId}
        mode={TICKET_FORM_MODE.EDIT}
        documentId={ticket.documentId}
        defaultValues={ticketResponseToFormValues(ticket)}
        onSuccess={goToList}
        bodyClassName=""
        renderFooter={() => null}
        onSubmittingChange={setIsSubmitting}
        onDirtyChange={setIsDirty}
      />
    </FormPageLayout>
  )
}
