import type { ClubSelect, EventSelect, TicketSelect } from '@afterdark/db'
import type { TicketResponse } from '@afterdark/types'
import type { CreateTicketInput, UpdateTicketInput } from '@afterdark/validators'

export function toTicketResponse(
  ticket: TicketSelect,
  event: Pick<EventSelect, 'documentId'> | null,
  club: Pick<ClubSelect, 'documentId' | 'name'> | null
): TicketResponse {
  return {
    documentId: ticket.documentId,
    name: ticket.name,
    price: ticket.price,
    quantity: ticket.quantity,
    status: ticket.status,
    description: ticket.description,
    type: ticket.type,
    saleStartsAt: ticket.saleStartsAt,
    saleEndsAt: ticket.saleEndsAt,
    eventId: event?.documentId ?? null,
    clubId: club?.documentId ?? null,
    clubName: club?.name ?? null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  }
}

export function toTicketUpsertInput(
  input: CreateTicketInput | UpdateTicketInput,
  eventId?: number | null
) {
  return {
    name: input.name,
    price: input.price,
    quantity: input.quantity,
    description: input.description,
    status: input.status,
    type: input.type,
    saleStartsAt: input.saleStartsAt ?? null,
    saleEndsAt: input.saleEndsAt ?? null,
    eventId: eventId ?? null,
  }
}
