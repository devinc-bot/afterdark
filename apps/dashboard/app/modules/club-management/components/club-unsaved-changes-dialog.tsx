import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'
import { CLUB_COPY } from '~/modules/club-management/constants/club.copy'

export type ClubUnsavedChangesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmLeave: () => void
}

export function ClubUnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirmLeave,
}: ClubUnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{CLUB_COPY.unsaved.title}</DialogTitle>
          <DialogDescription>{CLUB_COPY.unsaved.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {CLUB_COPY.unsaved.stay}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              onConfirmLeave()
            }}
          >
            {CLUB_COPY.unsaved.leave}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
