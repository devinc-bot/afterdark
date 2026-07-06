import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'
import { CalendarPlus } from 'lucide-react'
import { EVENT_FORM_MODE, EventForm } from '~/modules/events/components/event-form'

export function EventCreateDialog() {
  const { t } = useTranslation('events')
  const [open, setOpen] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
  }

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        className="w-full shrink-0 sm:w-auto"
        iconLeft={<CalendarPlus aria-hidden="true" />}
        onClick={() => setOpen(true)}
      >
        {t('form.trigger')}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          persistent
          className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="shrink-0 border-b border-hairline bg-surface-container-high px-8 pb-6 pt-8">
            <DialogTitle>{t('form.createTitle')}</DialogTitle>
            <DialogDescription>{t('form.createDescription')}</DialogDescription>
          </DialogHeader>

          {open ? (
            <EventForm key="create-event" mode={EVENT_FORM_MODE.CREATE} onSuccess={handleSuccess} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
