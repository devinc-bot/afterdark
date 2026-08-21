import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findEventImageAssetsByEventIds, findEventsPaginatedByOperator } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { EventResponse, PaginatedResponse, UserRole } from '@repo/types'
import type { ListEventsQueryInput } from '@repo/validators'
import { groupEventImagesByEventId, toEventResponse } from '../mappers/events.mapper'

@Injectable()
export class ListMyEventsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    operatorDocumentId: string,
    operatorRole: UserRole,
    query: ListEventsQueryInput
  ): Promise<PaginatedResponse<EventResponse>> {
    try {
      const { rows, total } = await findEventsPaginatedByOperator({
        operatorDocumentId,
        operatorRole,
        page: query.page,
        limit: query.limit,
        hasSales: query.hasSales,
      })

      const imagesByEventId = groupEventImagesByEventId(
        await findEventImageAssetsByEventIds(rows.map(({ event }) => event.id))
      )

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ event, location, faqs }) =>
          toEventResponse(event, location, imagesByEventId.get(event.id) ?? [], faqs)
        ),
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
