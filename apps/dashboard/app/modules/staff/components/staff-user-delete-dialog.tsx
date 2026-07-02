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
import type { StaffUserRecord } from '~/modules/staff/types/staff-user-record'

export type StaffUserDeleteDialogProps = {
  record: StaffUserRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (record: StaffUserRecord) => void
}

export function StaffUserDeleteDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
}: StaffUserDeleteDialogProps) {
  const { t } = useTranslation('staff')

  const handleConfirm = () => {
    if (!record) return
    onConfirm(record)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="destructive" size="sm">
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.descriptionPrefix')}{' '}
            <span className="font-semibold text-ink">{record?.name}</span>
            {t('delete.descriptionSuffix')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('delete.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={!record} onClick={handleConfirm}>
            {t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
