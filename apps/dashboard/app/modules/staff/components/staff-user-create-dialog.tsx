import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@afterdark/ui'
import { UserPlus } from 'lucide-react'
import { StaffInvitationSuccessPanel } from '~/modules/staff/components/staff-invitation-success-panel'
import {
  StaffUserForm,
  type StaffInvitationSuccess,
} from '~/modules/staff/components/staff-user-form'

type StaffUserCreateDialogProps = {
  onInviteSuccess: () => void
}

export function StaffUserCreateDialog({ onInviteSuccess }: StaffUserCreateDialogProps) {
  const { t } = useTranslation('staff')
  const [open, setOpen] = useState(false)
  const [invitation, setInvitation] = useState<StaffInvitationSuccess | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setInvitation(null)
    }
  }

  const handleInviteSuccess = (result: StaffInvitationSuccess) => {
    onInviteSuccess()
    setInvitation(result)
  }

  const handleCloseSuccess = () => {
    setInvitation(null)
    setOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        className="w-full sm:w-auto sm:shrink-0"
        iconLeft={<UserPlus aria-hidden="true" />}
        onClick={() => setOpen(true)}
      >
        {t('form.trigger')}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0">
          {invitation ? (
            <StaffInvitationSuccessPanel invitation={invitation} onClose={handleCloseSuccess} />
          ) : (
            <>
              <DialogHeader className="shrink-0 border-b border-hairline bg-surface-container-high px-8 pb-6 pt-8">
                <DialogTitle>{t('form.title')}</DialogTitle>
                <DialogDescription>{t('form.description')}</DialogDescription>
              </DialogHeader>

              {open ? (
                <StaffUserForm key="create-staff-user" onInviteSuccess={handleInviteSuccess} />
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
