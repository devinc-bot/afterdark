import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findEventImageAssetsByEventIds, findPublishedEventsPaginated } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import type { PaginatedResponse, PublicEventResponse } from '@afterdark/types'
import type { ListPublicEventsQueryInput } from '@afterdark/validators'
import { groupEventImagesByEventId, toPublicEventResponse } from '../mappers/events.mapper'

@Injectable()
export class ListPublicEventsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    query: ListPublicEventsQueryInput
  ): Promise<PaginatedResponse<PublicEventResponse>> {
    try {
      const { rows, total } = await findPublishedEventsPaginated({
        page: query.page,
        limit: query.limit,
        startsFrom: query.startsFrom,
        startsTo: query.startsTo,
        city: query.city,
        state: query.state,
      })

      const imagesByEventId = groupEventImagesByEventId(
        await findEventImageAssetsByEventIds(rows.map(({ event }) => event.id))
      )

      const totalPages = total === 0 ? total : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ event, location, address }) =>
          toPublicEventResponse(event, location, address, imagesByEventId.get(event.id) ?? [])
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
