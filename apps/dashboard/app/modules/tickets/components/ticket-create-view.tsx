import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { FormPageActions } from '~/modules/common/components/form-page-actions'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { FormPageLayout } from '~/modules/common/components/form-page-layout'
import {
  TICKET_FORM_MODE,
  TicketForm,
  TicketFormSubmitButton,
} from '~/modules/tickets/components/ticket-form'

export function TicketCreateView() {
  const { t } = useTranslation('tickets')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

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
            mode={TICKET_FORM_MODE.CREATE}
            isSubmitting={isSubmitting}
            disabled={!isDirty}
            variant={isDirty ? 'default' : 'outline'}
          />
        </FormPageActions>
      }
    >
      <TicketForm
        mode={TICKET_FORM_MODE.CREATE}
        onSuccess={goToList}
        bodyClassName=""
        renderFooter={() => null}
        onSubmittingChange={setIsSubmitting}
        onDirtyChange={setIsDirty}
      />
    </FormPageLayout>
  )
}
