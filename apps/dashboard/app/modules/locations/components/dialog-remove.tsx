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
import type { RegisteredLocation } from '~/modules/locations/components/registered-location-records'

export type LocationRemoveDialogProps = {
  location: RegisteredLocation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (location: RegisteredLocation) => void | Promise<void>
  isRemoving?: boolean
}

export function LocationRemoveDialog({
  location,
  open,
  onOpenChange,
  onConfirm,
  isRemoving = false,
}: LocationRemoveDialogProps) {
  const { t } = useTranslation('locations')

  const handleConfirm = async () => {
    if (!location) return
    await onConfirm(location)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="destructive" size="sm">
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.description')}{' '}
            <span className="font-semibold text-ink">{location?.name}</span>?{' '}
            {t('delete.descriptionSuffix')}
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
            disabled={!location}
            onClick={() => void handleConfirm()}
          >
            {t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
