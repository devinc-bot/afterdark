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

export type StaffUserDeactivateDialogProps = {
  record: StaffUserRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (record: StaffUserRecord) => void
}

export function StaffUserDeactivateDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
}: StaffUserDeactivateDialogProps) {
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
          <DialogTitle>{t('deactivate.title')}</DialogTitle>
          <DialogDescription>
            {t('deactivate.descriptionPrefix')}{' '}
            <span className="font-semibold text-ink">{record?.name}</span>
            {t('deactivate.descriptionSuffix')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('deactivate.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={!record} onClick={handleConfirm}>
            {t('deactivate.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
