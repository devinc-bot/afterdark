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
import type { TicketRecordItem } from '~/modules/tickets/components/ticket-record'

export type TicketRemoveDialogProps = {
  record: TicketRecordItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (record: TicketRecordItem) => void | Promise<void>
  isRemoving?: boolean
}

export function TicketRemoveDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
  isRemoving = false,
}: TicketRemoveDialogProps) {
  const { t } = useTranslation('tickets')

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
