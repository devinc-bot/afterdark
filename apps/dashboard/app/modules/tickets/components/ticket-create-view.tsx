import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
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
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-4">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="w-fit gap-2 px-0 text-ink-muted hover:text-ink"
            onClick={goToList}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('createPage.back')}
          </Button>
          <div className="max-w-2xl">
            <h1 className="text-balance font-heading text-2xl font-bold text-ink sm:text-3xl">
              {t('createPage.title')}
            </h1>
            <p className="mt-2 text-pretty text-base text-ink-muted">
              {t('createPage.description')}
            </p>
          </div>
        </header>

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
                <TicketFormSubmitButton
                  mode={TICKET_FORM_MODE.CREATE}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          />
        </div>
      </div>
    </main>
  )
}
