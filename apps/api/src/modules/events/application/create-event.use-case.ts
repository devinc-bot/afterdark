import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { createEvent, findClubOwnedByOwnerDocumentId } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import type { EventResponse } from '@afterdark/types'
import type { CreateEventInput } from '@afterdark/validators'
import { toEventResponse, toEventUpsertInput } from '../mappers/events.mapper'

@Injectable()
export class CreateEventUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string, input: CreateEventInput): Promise<EventResponse> {
    const club = await findClubOwnedByOwnerDocumentId(input.clubId, ownerDocumentId)

    if (!club) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    try {
      const row = await createEvent(toEventUpsertInput(input, club.id))
      return toEventResponse(row.event, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.CREATE_FAILED'))
    }
  }
}
