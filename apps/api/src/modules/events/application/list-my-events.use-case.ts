import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findEventImageAssetsByEventIds, findEventsPaginatedByOwner } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { EventResponse, PaginatedResponse } from '@repo/types'
import type { ListEventsQueryInput } from '@repo/validators'
import { groupEventImagesByEventId, toEventResponse } from '../mappers/events.mapper'

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

      const imagesByEventId = groupEventImagesByEventId(
        await findEventImageAssetsByEventIds(rows.map(({ event }) => event.id))
      )

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ event, location }) =>
          toEventResponse(event, location, imagesByEventId.get(event.id) ?? [])
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
