import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findEventImageAssetsByEventIds, findPurchasedTicketsByUserDocumentId } from '@repo/db'
import { TICKET_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import type { PurchasedTicketResponse } from '@repo/types'
import { toPurchasedTicketResponse } from '../mappers/tickets.mapper'

function firstEventImageUrlByEventId(
  imageRows: Awaited<ReturnType<typeof findEventImageAssetsByEventIds>>
): Map<number, string> {
  const imageUrlByEventId = new Map<number, string>()

  for (const { eventId, asset } of imageRows) {
    if (imageUrlByEventId.has(eventId)) continue

    const url = asset.url?.trim()
    if (url) imageUrlByEventId.set(eventId, url)
  }

  return imageUrlByEventId
}

@Injectable()
export class ListPurchasedTicketsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(userDocumentId: string): Promise<PurchasedTicketResponse[]> {
    try {
      const rows = await findPurchasedTicketsByUserDocumentId(userDocumentId)
      const eventImageUrlById = firstEventImageUrlByEventId(
        await findEventImageAssetsByEventIds(rows.map(({ event }) => event.id))
      )

      return rows.map(({ ticketSold, ticket, event, location }) =>
        toPurchasedTicketResponse(
          ticketSold,
          ticket,
          event,
          location,
          eventImageUrlById.get(event.id) ?? null
        )
      )
    } catch {
      throw new InternalServerErrorException(this.ts.translateError(TICKET_ERROR_CODE.LIST_FAILED))
    }
  }
}
