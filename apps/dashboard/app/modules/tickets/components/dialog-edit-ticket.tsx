import { useTranslation } from 'react-i18next'
import type { TicketResponse } from '@afterdark/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@afterdark/ui'
import { TICKET_FORM_MODE, TicketForm } from '~/modules/tickets/components/ticket-form'
import { ticketResponseToFormValues } from '~/modules/tickets/utils/ticket-form.mapper'

type TicketEditDialogProps = {
  ticket: TicketResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketEditDialog({ ticket, open, onOpenChange }: TicketEditDialogProps) {
  const { t } = useTranslation('tickets')

  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-hairline bg-surface-container-high px-8 pb-6 pt-8">
          <DialogTitle>{t('form.editTitle')}</DialogTitle>
          <DialogDescription>{t('form.editDescription')}</DialogDescription>
        </DialogHeader>

        {open && ticket ? (
          <TicketForm
            key={ticket.documentId}
            mode={TICKET_FORM_MODE.EDIT}
            documentId={ticket.documentId}
            defaultValues={ticketResponseToFormValues(ticket)}
            onSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
