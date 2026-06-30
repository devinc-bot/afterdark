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
  const { t } = useTranslation('dashboard')

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
          <DialogTitle>{t('signOut.title')}</DialogTitle>
          <DialogDescription>{t('signOut.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSigningOut}
            onClick={() => handleOpenChange(false)}
          >
            {t('signOut.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isSigningOut}
            onClick={handleConfirm}
          >
            {isSigningOut ? t('signOut.loading') : t('signOut.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
