import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findEventsPaginatedByOwner } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import type { EventResponse, PaginatedResponse } from '@afterdark/types'
import type { ListEventsQueryInput } from '@afterdark/validators'
import { toEventResponse } from '../mappers/events.mapper'

@Injectable()
export class ListMyEventsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    ownerDocumentId: string,
    query: ListEventsQueryInput
  ): Promise<PaginatedResponse<EventResponse>> {
    try {
      const { rows, total } = await findEventsPaginatedByOwner({
        ownerDocumentId,
        page: query.page,
        limit: query.limit,
      })

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ event, club }) => toEventResponse(event, club)),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.LIST_FAILED'))
    }
  }
}
