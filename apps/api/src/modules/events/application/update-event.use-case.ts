import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  findEventWithLocationOwnedByOwnerDocumentId,
  findLocationOwnedByOwnerDocumentId,
  updateEventByDocumentId,
} from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import type { EventResponse } from '@afterdark/types'
import type { UpdateEventInput } from '@afterdark/validators'
import { toEventResponse, toEventUpsertInput } from '../mappers/events.mapper'

@Injectable()
export class UpdateEventUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    ownerDocumentId: string,
    documentId: string,
    input: UpdateEventInput
  ): Promise<EventResponse> {
    const existing = await findEventWithLocationOwnedByOwnerDocumentId(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const location = await findLocationOwnedByOwnerDocumentId(input.locationId, ownerDocumentId)

    if (!location) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    try {
      const row = await updateEventByDocumentId(documentId, toEventUpsertInput(input, location.id))
      return toEventResponse(row.event, row.location)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.UPDATE_FAILED'))
    }
  }
}
