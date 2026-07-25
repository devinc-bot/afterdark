import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui'
import type { EventRecordItem } from '~/modules/events/components/event-record'

export type EventRemoveDialogProps = {
  record: EventRecordItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (record: EventRecordItem) => void | Promise<void>
  isRemoving?: boolean
}

export function EventRemoveDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
  isRemoving = false,
}: EventRemoveDialogProps) {
  const { t } = useTranslation('events')

  const handleConfirm = async () => {
    if (!record) return
    await onConfirm(record)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="destructive" size="sm">
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.description')} <span className="font-semibold text-ink">{record?.name}</span>
            ? {t('delete.descriptionSuffix')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isRemoving}
            onClick={() => onOpenChange(false)}
          >
            {t('delete.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isRemoving}
            disabled={!record}
            onClick={() => void handleConfirm()}
          >
            {t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
