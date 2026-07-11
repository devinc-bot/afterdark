import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  findClubOwnedByOwnerDocumentId,
  findEventWithClubOwnedByOwnerDocumentId,
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
    const existing = await findEventWithClubOwnedByOwnerDocumentId(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const club = await findClubOwnedByOwnerDocumentId(input.clubId, ownerDocumentId)

    if (!club) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    try {
      const row = await updateEventByDocumentId(documentId, toEventUpsertInput(input, club.id))
      return toEventResponse(row.event, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.UPDATE_FAILED'))
    }
  }
}
