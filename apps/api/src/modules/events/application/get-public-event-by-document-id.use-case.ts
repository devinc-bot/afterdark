import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findEventImageAssetsByEventIds,
  findLocationImageAssetsByLocationIds,
  findPublishedEventByDocumentId,
} from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { PublicEventDetailResponse } from '@repo/types'
import {
  groupEventImagesByEventId,
  toEventImageResponse,
  toPublicEventDetailResponse,
} from '../mappers/events.mapper'

@Injectable()
export class GetPublicEventByDocumentIdUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(documentId: string): Promise<PublicEventDetailResponse> {
    const row = await findPublishedEventByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const [eventImageRows, locationImageRows] = await Promise.all([
      findEventImageAssetsByEventIds([row.event.id]),
      findLocationImageAssetsByLocationIds([row.location.id]),
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
      row.organizer
    )
  }
}
