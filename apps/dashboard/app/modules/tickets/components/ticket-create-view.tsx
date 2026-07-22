import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { TicketAuthoringShell } from '~/modules/tickets/components/ticket-authoring-shell'
import {
  TICKET_FORM_MODE,
  TicketForm,
  TicketFormSubmitButton,
} from '~/modules/tickets/components/ticket-form'

export function TicketCreateView() {
  const { t } = useTranslation('tickets')
  const navigate = useNavigate()

  const goToList = useCallback(() => {
    void navigate({ to: DASHBOARD_ROUTES.tickets() })
  }, [navigate])

  return (
    <TicketAuthoringShell
      title={t('createPage.title')}
      description={t('createPage.description')}
      backLabel={t('createPage.back')}
      onBack={goToList}
    >
      <div className="overflow-hidden rounded-xl border border-hairline bg-surface-container-lowest">
        <TicketForm
          mode={TICKET_FORM_MODE.CREATE}
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
              <TicketFormSubmitButton mode={TICKET_FORM_MODE.CREATE} isSubmitting={isSubmitting} />
            </div>
          )}
        />
      </div>
    </TicketAuthoringShell>
  )
}
