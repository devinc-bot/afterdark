import { useTranslation } from 'react-i18next'
import type { EventResponse } from '@afterdark/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@afterdark/ui'
import { EVENT_FORM_MODE, EventForm } from '~/modules/events/components/event-form'
import { eventResponseToFormValues } from '~/modules/events/utils/event-form.mapper'

type EventEditDialogProps = {
  event: EventResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventEditDialog({ event, open, onOpenChange }: EventEditDialogProps) {
  const { t } = useTranslation('events')

  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        persistent
        className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 border-b border-hairline bg-surface-container-high px-8 pb-6 pt-8">
          <DialogTitle>{t('form.editTitle')}</DialogTitle>
          <DialogDescription>{t('form.editDescription')}</DialogDescription>
        </DialogHeader>

        {open && event ? (
          <EventForm
            key={event.documentId}
            mode={EVENT_FORM_MODE.EDIT}
            documentId={event.documentId}
            defaultValues={eventResponseToFormValues(event)}
            onSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
