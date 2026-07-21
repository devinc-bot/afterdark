import { useTranslation } from 'react-i18next'
import { EventWizardPage } from '~/modules/events/components/event-wizard-page'
import { EVENT_WIZARD_MODE } from '~/modules/events/utils/event-wizard.types'

export function EventWizardCreateView() {
  const { t } = useTranslation('events')

  return (
    <EventWizardPage
      mode={EVENT_WIZARD_MODE.CREATE}
      title={t('wizard.createTitle')}
      description={t('wizard.createDescription')}
    />
  )
}
