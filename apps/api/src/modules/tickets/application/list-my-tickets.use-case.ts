import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findEventImageAssetsByEventIds, findTicketsPaginatedByOwner } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { PaginatedResponse, TicketResponse } from '@repo/types'
import type { ListTicketsQueryInput } from '@repo/validators'
import { toTicketResponse } from '../mappers/tickets.mapper'

function firstEventImageUrlByEventId(
  imageRows: Awaited<ReturnType<typeof findEventImageAssetsByEventIds>>
): Map<number, string> {
  const map = new Map<number, string>()

  for (const { eventId, asset } of imageRows) {
    if (map.has(eventId)) continue
    const url = asset.url?.trim()
    if (url) map.set(eventId, url)
  }

  return map
}

@Injectable()
export class ListMyTicketsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    ownerDocumentId: string,
    query: ListTicketsQueryInput
  ): Promise<PaginatedResponse<TicketResponse>> {
    try {
      const { rows, total } = await findTicketsPaginatedByOwner({
        ownerDocumentId,
        page: query.page,
        limit: query.limit,
        status: query.status,
        locationDocumentId: query.locationId,
        salesFilter: query.salesFilter,
      })

      const eventImageUrlById = firstEventImageUrlByEventId(
        await findEventImageAssetsByEventIds(rows.flatMap(({ event }) => (event ? [event.id] : [])))
      )

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ ticket, ticketType, event, location, totalSold, revenue }) =>
          toTicketResponse(
            ticket,
            ticketType,
            event,
            location,
            { totalSold, revenue },
            event ? (eventImageUrlById.get(event.id) ?? null) : null
          )
        ),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.LIST_FAILED'))
    }
  }
}
