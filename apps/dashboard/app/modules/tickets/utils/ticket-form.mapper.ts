import { TICKET_STATUS, TICKET_TYPE, type TicketResponse } from '@afterdark/types'
import type { TicketFormValues } from '@afterdark/validators'
import type { TicketRecordItem } from '~/modules/tickets/components/ticket-record'

export const EMPTY_TICKET_FORM_VALUES: TicketFormValues = {
  name: '',
  clubId: '',
  type: TICKET_TYPE.GENERAL,
  price: '',
  quantity: '',
  description: '',
  startDate: '',
  endDate: '',
  status: TICKET_STATUS.ACTIVE,
}

function formatDateForDatetimeLocal(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function ticketResponseToFormValues(ticket: TicketResponse): TicketFormValues {
  return {
    name: ticket.name,
    clubId: ticket.clubId,
    type: ticket.type,
    price: String(ticket.price),
    quantity: String(ticket.quantity),
    description: ticket.description,
    startDate: formatDateForDatetimeLocal(new Date(ticket.startDate)),
    endDate: formatDateForDatetimeLocal(new Date(ticket.endDate)),
    status: ticket.status,
  }
}

function clubInitials(clubName: string): string {
  const parts = clubName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CL'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

function resolveTicketTypeTone(type: TicketResponse['type']): TicketRecordItem['ticketTypeTone'] {
  if (type === TICKET_TYPE.VIP) return 'primary'
  return 'default'
}

export function ticketResponseToRecordItem(ticket: TicketResponse): TicketRecordItem {
  return {
    id: ticket.documentId,
    name: ticket.name,
    clubName: ticket.clubName,
    clubInitials: clubInitials(ticket.clubName),
    clubAvatarClassName: 'border-hairline-strong bg-surface-container-high text-ink-muted',
    ticketType: ticket.type,
    ticketTypeTone: resolveTicketTypeTone(ticket.type),
    price: ticket.price,
    quantity: ticket.quantity,
    totalSold: 0,
    revenue: 0,
    status: ticket.status,
  }
}
