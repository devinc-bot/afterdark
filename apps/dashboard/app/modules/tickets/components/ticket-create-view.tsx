import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { FormPageLayout } from '~/modules/common/components/form-page-layout'
import {
  TICKET_FORM_MODE,
  TicketForm,
  TicketFormSubmitButton,
} from '~/modules/tickets/components/ticket-form'

export function TicketCreateView() {
  const { t } = useTranslation('tickets')
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goToList = useCallback(() => {
    void navigate({ to: DASHBOARD_ROUTES.tickets() })
  }, [navigate])

  return (
    <FormPageLayout
      title={t('createPage.title')}
      description={t('createPage.description')}
      backLabel={t('createPage.back')}
      onBack={goToList}
      footer={
        <>
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
        </>
      }
    >
      <TicketForm
        mode={TICKET_FORM_MODE.CREATE}
        onSuccess={goToList}
        bodyClassName=""
        renderFooter={() => null}
        onSubmittingChange={setIsSubmitting}
      />
    </FormPageLayout>
  )
}
