import { useTranslation } from 'react-i18next'
import { EventFormPage } from '~/modules/events/components/event-form-page'
import { EVENT_FORM_MODE } from '~/modules/events/utils/event-form.types'

export function EventCreateView() {
  const { t } = useTranslation('events')

  return (
    <EventFormPage
      mode={EVENT_FORM_MODE.CREATE}
      title={t('form.createTitle')}
      description={t('form.createDescription')}
    />
  )
}
