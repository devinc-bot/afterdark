import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { TicketResponse } from '@afterdark/types'
import { Button, Skeleton } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { LoadErrorBanner } from '~/modules/common/components/load-error-banner'
import { TicketAuthoringShell } from '~/modules/tickets/components/ticket-authoring-shell'
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

function TicketFormFieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function TicketEditLoadingView() {
  const { t } = useTranslation('tickets')
  const goToList = useGoToTicketsList()

  return (
    <TicketAuthoringShell
      title={t('editPage.title')}
      description={t('editPage.description')}
      backLabel={t('editPage.back')}
      onBack={goToList}
    >
      <div
        className="overflow-hidden rounded-xl border border-hairline bg-surface-container-lowest"
        aria-busy="true"
      >
        <span className="sr-only">{t('editPage.loading')}</span>
        <div className="flex flex-col gap-5 px-6 py-6 sm:px-8">
          <TicketFormFieldSkeleton />
          <TicketFormFieldSkeleton />
          <div className="grid gap-5 sm:grid-cols-2">
            <TicketFormFieldSkeleton />
            <TicketFormFieldSkeleton />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TicketFormFieldSkeleton />
            <TicketFormFieldSkeleton />
          </div>
          <TicketFormFieldSkeleton />
        </div>
        <div className="flex flex-col gap-3 border-t border-hairline px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
      </div>
    </TicketAuthoringShell>
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
    <TicketAuthoringShell
      title={t('editPage.title')}
      description={t('editPage.description')}
      backLabel={t('editPage.back')}
      onBack={goToList}
    >
      <LoadErrorBanner
        className="my-0"
        title={t('editPage.loadErrorTitle')}
        message={message}
        retryLabel={t('editPage.retry')}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    </TicketAuthoringShell>
  )
}

export function TicketEditNotFoundView() {
  const { t } = useTranslation('tickets')
  const goToList = useGoToTicketsList()

  return (
    <TicketAuthoringShell
      title={t('editPage.notFoundTitle')}
      description={t('editPage.notFoundDescription')}
      backLabel={t('editPage.back')}
      onBack={goToList}
    >
      <div className="rounded-xl border border-dashed border-hairline bg-surface-container-low/60 px-6 py-10 text-center sm:px-8">
        <Button type="button" variant="outline" onClick={goToList}>
          {t('editPage.back')}
        </Button>
      </div>
    </TicketAuthoringShell>
  )
}

export function TicketEditView({ ticket }: TicketEditViewProps) {
  const { t } = useTranslation('tickets')
  const goToList = useGoToTicketsList()

  return (
    <TicketAuthoringShell
      title={t('editPage.title')}
      description={t('editPage.description')}
      backLabel={t('editPage.back')}
      onBack={goToList}
    >
      <div className="overflow-hidden rounded-xl border border-hairline bg-surface-container-lowest">
        <TicketForm
          key={ticket.documentId}
          mode={TICKET_FORM_MODE.EDIT}
          documentId={ticket.documentId}
          defaultValues={ticketResponseToFormValues(ticket)}
          onSuccess={goToList}
          bodyClassName="px-6 py-6 sm:px-8"
          renderFooter={({ isSubmitting }) => (
            <div className="flex flex-col gap-3 border-t border-hairline px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
              <Button
                type="button"
                variant="outline"
                size="default"
                disabled={isSubmitting}
                className="min-w-36 sm:min-w-40"
                onClick={goToList}
              >
                {t('form.cancel')}
              </Button>
              <TicketFormSubmitButton mode={TICKET_FORM_MODE.EDIT} isSubmitting={isSubmitting} />
            </div>
          )}
        />
      </div>
    </TicketAuthoringShell>
  )
}
