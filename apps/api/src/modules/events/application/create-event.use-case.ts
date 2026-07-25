import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { createEvent, findLocationOwnedByOwnerDocumentId } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { EventResponse } from '@repo/types'
import { EVENT_IMAGE_MAX_COUNT, type CreateEventInput } from '@repo/validators'
import { toEventResponse, toEventUpsertInput } from '../mappers/events.mapper'
import { validateEventImageLimit } from '../validators/event.validator'
import { EventImagesService } from './services/event-images.service'

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EventImagesService) private readonly eventImages: EventImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    ownerDocumentId: string,
    input: CreateEventInput,
    files: Express.Multer.File[] = []
  ): Promise<EventResponse> {
    const location = await findLocationOwnedByOwnerDocumentId(input.locationId, ownerDocumentId)

    if (!location) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    validateEventImageLimit(
      [],
      files,
      this.ts.translateError('event.TOO_MANY_IMAGES', { max: EVENT_IMAGE_MAX_COUNT })
    )

    const uploadedImages = await this.eventImages.upload(files)

    try {
      const row = await createEvent(toEventUpsertInput(input, location.id))
      const images = await this.eventImages.saveNew(row.event.id, files, uploadedImages)
      return toEventResponse(row.event, row.location, images)
    } catch (error) {
      await this.eventImages.rollback(uploadedImages)
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException(this.ts.translateError('event.CREATE_FAILED'))
    }
  }
}
