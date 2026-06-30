import type { ClubSelect, TicketSelect } from '@afterdark/db'
import type { TicketResponse } from '@afterdark/types'
import type { CreateTicketInput, UpdateTicketInput } from '@afterdark/validators'

export function toTicketResponse(
  ticket: TicketSelect,
  club: Pick<ClubSelect, 'documentId' | 'name'>
): TicketResponse {
  return {
    documentId: ticket.documentId,
    name: ticket.name,
    price: ticket.price,
    quantity: ticket.quantity,
    status: ticket.status,
    startDate: ticket.startDate,
    endDate: ticket.endDate,
    description: ticket.description,
    type: ticket.type,
    clubId: club.documentId,
    clubName: club.name,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  }
}

export function toTicketUpsertInput(input: CreateTicketInput | UpdateTicketInput) {
  return {
    name: input.name,
    price: input.price,
    quantity: input.quantity,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    type: input.type,
  }
}
