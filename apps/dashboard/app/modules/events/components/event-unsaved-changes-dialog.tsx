import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'

export type EventUnsavedChangesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmLeave: () => void
}

export function EventUnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirmLeave,
}: EventUnsavedChangesDialogProps) {
  const { t } = useTranslation('events')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('unsaved.title')}</DialogTitle>
          <DialogDescription>{t('unsaved.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('unsaved.stay')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              onConfirmLeave()
            }}
          >
            {t('unsaved.leave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
