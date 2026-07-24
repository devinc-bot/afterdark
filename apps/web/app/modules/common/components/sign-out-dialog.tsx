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

export type SignOutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isSigningOut?: boolean
}

export function SignOutDialog({
  open,
  onOpenChange,
  onConfirm,
  isSigningOut = false,
}: SignOutDialogProps) {
  const { t } = useTranslation('landing')

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
          <DialogTitle>{t('userMenu.signOutDialog.title')}</DialogTitle>
          <DialogDescription>{t('userMenu.signOutDialog.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSigningOut}
            onClick={() => handleOpenChange(false)}
          >
            {t('userMenu.signOutDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isSigningOut}
            onClick={handleConfirm}
          >
            {isSigningOut
              ? t('userMenu.signOutDialog.loading')
              : t('userMenu.signOutDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
