import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findEventWithLocationOwnedByOwnerDocumentId } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import type { EventResponse } from '@afterdark/types'
import { toEventResponse } from '../mappers/events.mapper'
import { EventImagesService } from './services/event-images.service'

@Injectable()
export class GetEventByDocumentIdUseCase {
  constructor(
    @Inject(EventImagesService) private readonly eventImages: EventImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(ownerDocumentId: string, documentId: string): Promise<EventResponse> {
    const row = await findEventWithLocationOwnedByOwnerDocumentId(documentId, ownerDocumentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const images = await this.eventImages.getByEventId(row.event.id)
    return toEventResponse(row.event, row.location, images)
  }
}
