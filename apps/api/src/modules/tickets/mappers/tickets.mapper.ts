import type { LocationSelect, EventSelect, TicketSelect } from '@afterdark/db'
import type { TicketResponse } from '@afterdark/types'
import type { CreateTicketInput, UpdateTicketInput } from '@afterdark/validators'

type TicketSalesStats = {
  totalSold: number
  revenue: number
}

const EMPTY_SALES: TicketSalesStats = { totalSold: 0, revenue: 0 }

export function toTicketResponse(
  ticket: TicketSelect,
  event: Pick<EventSelect, 'documentId'> | null,
  location: Pick<LocationSelect, 'documentId' | 'name'> | null,
  sales: TicketSalesStats = EMPTY_SALES
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
    locationId: location?.documentId ?? null,
    locationName: location?.name ?? null,
    totalSold: sales.totalSold,
    revenue: sales.revenue,
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
