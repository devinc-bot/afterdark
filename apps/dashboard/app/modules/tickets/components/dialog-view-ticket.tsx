import { Button, Dialog, DialogClose, DialogContent } from '@repo/ui'
import { X } from 'lucide-react'
import type { TicketRecordItem } from '~/modules/tickets/components/ticket-record'
import {
  ViewTicketMobile,
  type MobileTicketTemplate,
} from '~/modules/tickets/components/view-ticket-mobile'

function getTicketBenefits(): string[] {
  return ['Acceso general', 'Validación en puerta']
}

function recordToMobileTemplate(
  record: TicketRecordItem,
  ticketTypeLabel: string
): MobileTicketTemplate {
  return {
    clubName: record.clubName,
    ticketTypeLabel,
    price: record.price,
    validityLabel: 'Acceso 24h',
    benefits: getTicketBenefits(),
  }
}

export type TicketViewDialogProps = {
  record: TicketRecordItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketViewDialog({ record, open, onOpenChange }: TicketViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-full border-0 bg-transparent">
        {record ? (
          <div className="relative">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-ink hover:bg-surface-strong"
                aria-label="Cerrar"
              >
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
            <ViewTicketMobile ticket={recordToMobileTemplate(record, record.ticketType)} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
