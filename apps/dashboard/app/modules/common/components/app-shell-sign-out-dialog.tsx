import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'
import { APP_SHELL_COPY } from '~/modules/common/constants/app-shell.copy'

export type AppShellSignOutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isSigningOut?: boolean
}

export function AppShellSignOutDialog({
  open,
  onOpenChange,
  onConfirm,
  isSigningOut = false,
}: AppShellSignOutDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isSigningOut && !nextOpen) return
    onOpenChange(nextOpen)
  }

  const handleConfirm = () => {
    if (isSigningOut) return
    void onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{APP_SHELL_COPY.signOutDialog.title}</DialogTitle>
          <DialogDescription>{APP_SHELL_COPY.signOutDialog.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSigningOut}
            onClick={() => handleOpenChange(false)}
          >
            {APP_SHELL_COPY.signOutDialog.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isSigningOut}
            onClick={handleConfirm}
          >
            {isSigningOut
              ? APP_SHELL_COPY.signOutDialog.signingOut
              : APP_SHELL_COPY.signOutDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
