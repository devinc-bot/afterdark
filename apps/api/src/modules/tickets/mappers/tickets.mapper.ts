import type {
  EventSelect,
  LocationSelect,
  TicketSelect,
  TicketSoldSelect,
  TicketTypeSelect,
} from '@repo/db'
import type { PurchasedTicketResponse, TicketResponse } from '@repo/types'
import type { CreateTicketInput, UpdateTicketInput } from '@repo/validators'

type TicketSalesStats = {
  totalSold: number
  revenue: number
}

const EMPTY_SALES: TicketSalesStats = { totalSold: 0, revenue: 0 }

export function toTicketResponse(
  ticket: TicketSelect,
  ticketType: TicketTypeSelect,
  event: Pick<EventSelect, 'documentId' | 'name'> | null,
  location: Pick<LocationSelect, 'documentId' | 'name'> | null,
  sales: TicketSalesStats = EMPTY_SALES,
  eventImageUrl: string | null = null
): TicketResponse {
  return {
    documentId: ticket.documentId,
    price: ticket.price,
    quantity: ticket.quantity,
    status: ticket.status,
    description: ticket.description,
    ticketType: { documentId: ticketType.documentId, name: ticketType.name },
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
  ticketType: TicketTypeSelect,
  event: Pick<EventSelect, 'slug' | 'name' | 'startsAt'>,
  location: Pick<LocationSelect, 'name'>,
  eventImageUrl: string | null
): PurchasedTicketResponse {
  return {
    documentId: ticketSold.documentId,
    checkedIn: ticketSold.checkedIn,
    usedAt: ticketSold.usedAt,
    ticketType: { documentId: ticketType.documentId, name: ticketType.name },
    eventSlug: event.slug,
    eventName: event.name,
    eventStartsAt: event.startsAt,
    locationName: location.name,
    eventImageUrl,
  }
}

export function toTicketUpsertInput(
  input: CreateTicketInput | UpdateTicketInput,
  eventId: number | null,
  ticketTypeId: number
) {
  return {
    price: input.price,
    quantity: input.quantity,
    description: input.description,
    status: input.status,
    ticketTypeId,
    saleStartsAt: input.saleStartsAt ?? null,
    saleEndsAt: input.saleEndsAt ?? null,
    eventId: eventId ?? null,
  }
}
