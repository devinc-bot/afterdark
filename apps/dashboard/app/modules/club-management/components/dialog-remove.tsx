import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'
import type { RegisteredClub } from '~/modules/club-management/components/registered-club-records'

export type ClubRemoveDialogProps = {
  club: RegisteredClub | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (club: RegisteredClub) => void | Promise<void>
  isRemoving?: boolean
}

export function ClubRemoveDialog({
  club,
  open,
  onOpenChange,
  onConfirm,
  isRemoving = false,
}: ClubRemoveDialogProps) {
  const handleConfirm = async () => {
    if (!club) return
    await onConfirm(club)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="destructive" size="sm">
        <DialogHeader>
          <DialogTitle>Eliminar club</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés eliminar{' '}
            <span className="font-semibold text-ink">{club?.name}</span>? Esta acción no se puede
            revertir.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isRemoving}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isRemoving}
            disabled={!club}
            onClick={() => void handleConfirm()}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
