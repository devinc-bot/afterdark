import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
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
  const handleConfirm = () => {
    if (!record) return
    onConfirm(record)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="destructive" size="sm">
        <DialogHeader>
          <DialogTitle>{STAFF_COPY.deactivate.title}</DialogTitle>
          <DialogDescription>
            {STAFF_COPY.deactivate.descriptionPrefix}{' '}
            <span className="font-semibold text-ink">{record?.name}</span>
            {STAFF_COPY.deactivate.descriptionSuffix}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {STAFF_COPY.deactivate.cancel}
          </Button>
          <Button type="button" variant="destructive" disabled={!record} onClick={handleConfirm}>
            {STAFF_COPY.deactivate.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
