import type { EventSelect, LocationSelect, TicketSelect, TicketSoldSelect } from '@repo/db'
import type { PurchasedTicketResponse, TicketResponse } from '@repo/types'
import type { CreateTicketInput, UpdateTicketInput } from '@repo/validators'

type TicketSalesStats = {
  totalSold: number
  revenue: number
}

const EMPTY_SALES: TicketSalesStats = { totalSold: 0, revenue: 0 }

export function toTicketResponse(
  ticket: TicketSelect,
  event: Pick<EventSelect, 'documentId' | 'name'> | null,
  location: Pick<LocationSelect, 'documentId' | 'name'> | null,
  sales: TicketSalesStats = EMPTY_SALES,
  eventImageUrl: string | null = null
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
    eventName: event?.name ?? null,
    eventImageUrl,
    locationId: location?.documentId ?? null,
    locationName: location?.name ?? null,
    totalSold: sales.totalSold,
    revenue: sales.revenue,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  }
}

export function toPurchasedTicketResponse(
  ticketSold: TicketSoldSelect,
  ticket: Pick<TicketSelect, 'name' | 'type'>,
  event: Pick<EventSelect, 'name' | 'startsAt'>,
  location: Pick<LocationSelect, 'name'>,
  eventImageUrl: string | null
): PurchasedTicketResponse {
  return {
    documentId: ticketSold.documentId,
    qrCode: ticketSold.qrCode,
    checkedIn: ticketSold.checkedIn,
    usedAt: ticketSold.usedAt,
    ticketName: ticket.name,
    ticketType: ticket.type,
    eventName: event.name,
    eventStartsAt: event.startsAt,
    locationName: location.name,
    eventImageUrl,
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
