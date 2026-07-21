import { useTranslation } from 'react-i18next'
import type { EventResponse } from '@afterdark/types'
import { EventFormPage } from '~/modules/events/components/event-form-page'
import { EVENT_FORM_MODE } from '~/modules/events/utils/event-form.types'

type EventEditViewProps = {
  event: EventResponse
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
