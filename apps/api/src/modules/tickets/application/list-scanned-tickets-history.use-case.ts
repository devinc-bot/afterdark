import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findEventOrganizationByOperator, findScannedTicketsPaginatedByEvent } from '@repo/db'
import { TICKET_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import type { ScannedTicketHistoryResponse, UserRole } from '@repo/types'
import type { ListScannedTicketsQueryInput } from '@repo/validators'
import { toScannedTicketHistoryItem } from '../mappers/scanned-tickets-history.mapper'

@Injectable()
export class ListScannedTicketsHistoryUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    operatorDocumentId: string,
    operatorRole: UserRole,
    query: ListScannedTicketsQueryInput
  ): Promise<ScannedTicketHistoryResponse> {
    const organization = await findEventOrganizationByOperator({
      operatorDocumentId,
      operatorRole,
      eventDocumentId: query.eventId,
    })

    if (!organization) {
      throw new NotFoundException(this.ts.translateError(TICKET_ERROR_CODE.NOT_FOUND))
    }

    const { rows, total } = await findScannedTicketsPaginatedByEvent({
      eventDocumentId: query.eventId,
      page: query.page,
      limit: query.limit,
    })

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

    return {
      data: rows.map(toScannedTicketHistoryItem),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    }
  }
}
