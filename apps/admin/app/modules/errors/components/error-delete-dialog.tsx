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
import type { ApiErrorRecordResponse } from '@repo/types'

export function ErrorDeleteDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  record: ApiErrorRecordResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  const { t } = useTranslation('admin')

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting && !nextOpen) return
    onOpenChange(nextOpen)
  }

  function handleConfirm() {
    if (isDeleting || !record) return
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="sm"
        variant="destructive"
        persistent={isDeleting}
        showCloseButton={!isDeleting}
      >
        <DialogHeader>
          <DialogTitle>{t('errors.delete.title')}</DialogTitle>
          <DialogDescription>{t('errors.delete.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => handleOpenChange(false)}
          >
            {t('errors.delete.cancel')}
          </Button>
          <Button type="button" variant="destructive" loading={isDeleting} onClick={handleConfirm}>
            {isDeleting ? t('errors.delete.deleting') : t('errors.delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
