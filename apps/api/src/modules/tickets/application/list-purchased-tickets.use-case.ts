import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  findEventImageAssetsByEventIds,
  findPurchasedTicketsPaginatedByUserDocumentId,
} from '@repo/db'
import { TICKET_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import type { PaginatedResponse, PurchasedTicketResponse } from '@repo/types'
import type { ListPurchasedTicketsQueryInput } from '@repo/validators'
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

  async execute(
    userDocumentId: string,
    query: ListPurchasedTicketsQueryInput
  ): Promise<PaginatedResponse<PurchasedTicketResponse>> {
    try {
      const { rows, total } = await findPurchasedTicketsPaginatedByUserDocumentId({
        userDocumentId,
        page: query.page,
        limit: query.limit,
      })
      const eventImageUrlById = firstEventImageUrlByEventId(
        await findEventImageAssetsByEventIds(rows.map(({ event }) => event.id))
      )

      return {
        data: rows.map(({ ticketSold, ticketType, event, location }) =>
          toPurchasedTicketResponse(
            ticketSold,
            ticketType,
            event,
            location,
            eventImageUrlById.get(event.id) ?? null
          )
        ),
        total,
        page: query.page,
        limit: query.limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError(TICKET_ERROR_CODE.LIST_FAILED))
    }
  }
}
