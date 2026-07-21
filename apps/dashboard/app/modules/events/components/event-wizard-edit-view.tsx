import { useTranslation } from 'react-i18next'
import type { EventResponse } from '@afterdark/types'
import { EventWizardPage } from '~/modules/events/components/event-wizard-page'
import { EVENT_WIZARD_MODE } from '~/modules/events/utils/event-wizard.types'

type EventWizardEditViewProps = {
  event: EventResponse
}

export function EventWizardEditView({ event }: EventWizardEditViewProps) {
  const { t } = useTranslation('events')

  return (
    <EventWizardPage
      mode={EVENT_WIZARD_MODE.EDIT}
      title={t('wizard.editTitle')}
      description={t('wizard.editDescription')}
      event={event}
    />
  )
}
