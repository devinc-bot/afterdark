import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findTicketsPaginatedByOwner } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { PaginatedResponse, TicketResponse } from '@repo/types'
import type { ListTicketsQueryInput } from '@repo/validators'
import { toTicketResponse } from '../mappers/tickets.mapper'

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

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ ticket, event, location, totalSold, revenue }) =>
          toTicketResponse(ticket, event, location, { totalSold, revenue })
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
