import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { TicketTypeResponse } from '@repo/types'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  toast,
} from '@repo/ui'
import { Plus } from 'lucide-react'
import { useCreateTicketType } from '~/modules/ticket-types/mutation/use-ticket-type-mutations'

type TicketTypeCreateDialogProps = {
  onCreated: (ticketType: TicketTypeResponse) => void
}

export function TicketTypeCreateDialog({ onCreated }: TicketTypeCreateDialogProps) {
  const { t } = useTranslation('tickets')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createTicketTypeMutation = useCreateTicketType()

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setName('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const trimmedName = name.trim()
    if (!trimmedName) return

    try {
      const ticketType = await createTicketTypeMutation.mutateAsync({ name: trimmedName })
      onCreated(ticketType)
      toast.success(t('ticketTypes.createSuccess'))
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('ticketTypes.createError'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto justify-start px-0 text-primary"
        iconLeft={<Plus aria-hidden="true" />}
        onClick={() => setOpen(true)}
      >
        {t('ticketTypes.createTrigger')}
      </Button>
      <DialogContent size="sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{t('ticketTypes.createTitle')}</DialogTitle>
            <DialogDescription>{t('ticketTypes.createDescription')}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            placeholder={t('ticketTypes.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
            disabled={createTicketTypeMutation.isPending}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createTicketTypeMutation.isPending}
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createTicketTypeMutation.isPending}
              disabled={!name.trim()}
            >
              {t('ticketTypes.createSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
