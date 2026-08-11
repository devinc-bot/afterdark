import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findEventImageAssetsByEventIds,
  findLocationImageAssetsByLocationIds,
  findPublishedEventByDocumentId,
  findTicketsWithCompletedSalesByEventId,
} from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import { TICKET_STATUS, type PublicEventDetailResponse } from '@repo/types'
import { ENV } from '../../../config/env'
import {
  groupEventImagesByEventId,
  toEventImageResponse,
  toPublicEventDetailResponse,
  toPublicPurchasableTicketResponse,
} from '../mappers/events.mapper'

function isTicketOnSale(ticket: {
  status: string
  saleStartsAt: Date | null
  saleEndsAt: Date | null
}) {
  const now = new Date()

  return (
    ticket.status === TICKET_STATUS.ACTIVE &&
    (!ticket.saleStartsAt || ticket.saleStartsAt <= now) &&
    (!ticket.saleEndsAt || ticket.saleEndsAt >= now)
  )
}

function arePlatformPaymentsConfigured(): boolean {
  return Boolean(
    ENV.MERCADOPAGO_ACCESS_TOKEN && ENV.MERCADOPAGO_WEBHOOK_SECRET && ENV.API_PUBLIC_URL
  )
}

@Injectable()
export class GetPublicEventByDocumentIdUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(documentId: string): Promise<PublicEventDetailResponse> {
    const row = await findPublishedEventByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const [eventImageRows, locationImageRows, ticketRows] = await Promise.all([
      findEventImageAssetsByEventIds([row.event.id]),
      findLocationImageAssetsByLocationIds([row.location.id]),
      findTicketsWithCompletedSalesByEventId(row.event.id),
    ])

    const imagesByEventId = groupEventImagesByEventId(eventImageRows)
    const locationImages = locationImageRows.map(({ asset }) => toEventImageResponse(asset))

    return toPublicEventDetailResponse(
      row.event,
      row.location,
      row.address,
      imagesByEventId.get(row.event.id) ?? [],
      locationImages,
      row.faqs,
      row.organizer,
      ticketRows
        .filter(({ ticket }) => isTicketOnSale(ticket))
        .map(({ ticket, completedSalesQuantity }) =>
          toPublicPurchasableTicketResponse(ticket, completedSalesQuantity)
        ),
      arePlatformPaymentsConfigured()
    )
  }
}
