import type {
  AddressSelect,
  AssetSelect,
  EventFaqSelect,
  EventSelect,
  LocationSelect,
  TicketSelect,
} from '@repo/db'
import type {
  EventFaqResponse,
  EventImageResponse,
  EventResponse,
  PublicEventDetailResponse,
  PublicEventOrganizer,
  PublicEventResponse,
  PublicPurchasableTicketResponse,
  PublishedEventOrganizerRow,
} from '@repo/types'
import type { CreateEventInput, UpdateEventInput } from '@repo/validators'

const MILLISECONDS_PER_HOUR = 3_600_000

export function toPublicEventOrganizer(row: PublishedEventOrganizerRow): PublicEventOrganizer {
  const organizationName = row.organizationName?.trim()
  const personalName = `${row.name} ${row.lastName}`.trim()

  return {
    name: organizationName && organizationName.length > 0 ? organizationName : personalName,
    avatar: row.avatar,
    firstName: row.name,
    lastName: row.lastName,
  }
}

export function toEventImageResponse(asset: AssetSelect): EventImageResponse {
  return {
    documentId: asset.documentId,
    name: asset.name,
    url: asset.url ?? '',
  }
}

export function toEventFaqResponse(faq: EventFaqSelect): EventFaqResponse {
  return {
    documentId: faq.documentId,
    question: faq.question,
    answer: faq.answer,
  }
}

export function toEventResponse(
  event: EventSelect,
  location: Pick<LocationSelect, 'documentId' | 'name'>,
  images: EventImageResponse[] = [],
  faqs: EventFaqSelect[] = []
): EventResponse {
  return {
    documentId: event.documentId,
    locationId: location.documentId,
    locationName: location.name,
    name: event.name,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    status: event.status,
    images,
    faqs: faqs.map(toEventFaqResponse),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

export function toPublicEventResponse(
  event: EventSelect,
  location: Pick<LocationSelect, 'name'>,
  address: Pick<AddressSelect, 'city' | 'state' | 'latitude' | 'longitude'>,
  images: EventImageResponse[] = []
): PublicEventResponse {
  return {
    documentId: event.documentId,
    name: event.name,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    locationName: location.name,
    city: address.city ?? null,
    state: address.state ?? null,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    images,
  }
}

export function toPublicEventDetailResponse(
  event: EventSelect,
  location: Pick<LocationSelect, 'name'>,
  address: Pick<
    AddressSelect,
    'address' | 'streetNumber' | 'city' | 'state' | 'latitude' | 'longitude'
  > | null,
  images: EventImageResponse[] = [],
  locationImages: EventImageResponse[] = [],
  faqs: EventFaqSelect[] = [],
  organizer: PublishedEventOrganizerRow,
  tickets: PublicPurchasableTicketResponse[] = [],
  paymentsReady = false
): PublicEventDetailResponse {
  return {
    documentId: event.documentId,
    name: event.name,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    locationName: location.name,
    address: address
      ? {
          street: address.address,
          streetNumber: address.streetNumber,
          city: address.city,
          state: address.state,
          latitude: address.latitude ?? null,
          longitude: address.longitude ?? null,
        }
      : null,
    images,
    locationImages,
    faqs: faqs.map(toEventFaqResponse),
    organizer: toPublicEventOrganizer(organizer),
    tickets,
    paymentsReady,
  }
}

export function toPublicPurchasableTicketResponse(
  ticket: TicketSelect,
  completedSalesQuantity: number
): PublicPurchasableTicketResponse {
  return {
    documentId: ticket.documentId,
    name: ticket.name,
    price: ticket.price,
    type: ticket.type,
    remainingQuantity: Math.max(ticket.quantity - completedSalesQuantity, 0),
    saleStartsAt: ticket.saleStartsAt,
    saleEndsAt: ticket.saleEndsAt,
  }
}

export function toEventUpsertInput(
  input: CreateEventInput | UpdateEventInput,
  locationId: number,
  organizationId: number
) {
  return {
    locationId,
    organizationId,
    name: input.name,
    description: input.description,
    startsAt: input.startsAt,
    endsAt: new Date(input.startsAt.getTime() + input.durationHours * MILLISECONDS_PER_HOUR),
    status: input.status,
    faqs: input.faqs ?? [],
  }
}

export function groupEventImagesByEventId(
  imageRows: { eventId: number; asset: AssetSelect }[]
): Map<number, EventImageResponse[]> {
  const map = new Map<number, EventImageResponse[]>()

  for (const { eventId, asset } of imageRows) {
    const images = map.get(eventId) ?? []
    images.push(toEventImageResponse(asset))
    map.set(eventId, images)
  }

  return map
}
