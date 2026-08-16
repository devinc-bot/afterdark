import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  findEventImageAssetsByEventIds,
  findEventWithLocationOwnedByOwnerDocumentId,
  findLocationOwnedByOwnerDocumentId,
  findSoleOrganizationByOwnerDocumentId,
  updateEventByDocumentId,
} from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { EventResponse } from '@repo/types'
import { EVENT_IMAGE_MAX_COUNT, type UpdateEventInput } from '@repo/validators'
import { toEventResponse, toEventUpsertInput } from '../mappers/events.mapper'
import { assertValidKeepImageIds, validateEventImageLimit } from '../validators/event.validator'
import { EventImagesService } from './services/event-images.service'

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(EventImagesService) private readonly eventImages: EventImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    ownerDocumentId: string,
    documentId: string,
    input: UpdateEventInput,
    files: Express.Multer.File[] = [],
    keepImageIds: string[] = []
  ): Promise<EventResponse> {
    const existing = await findEventWithLocationOwnedByOwnerDocumentId(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const location = await findLocationOwnedByOwnerDocumentId(input.locationId, ownerDocumentId)

    if (!location) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    const organization = await findSoleOrganizationByOwnerDocumentId(ownerDocumentId)

    if (!organization) {
      throw new InternalServerErrorException(this.ts.translateError('event.UPDATE_FAILED'))
    }

    const eventId = existing.event.id
    const currentImages = await findEventImageAssetsByEventIds([eventId])

    assertValidKeepImageIds(
      currentImages.map(({ asset }) => asset.documentId),
      keepImageIds,
      this.ts.translateError('event.INVALID_IMAGE_IDS')
    )
    validateEventImageLimit(
      keepImageIds,
      files,
      this.ts.translateError('event.TOO_MANY_IMAGES', { max: EVENT_IMAGE_MAX_COUNT })
    )

    const uploadedImages = await this.eventImages.upload(files)

    try {
      const row = await updateEventByDocumentId(
        documentId,
        toEventUpsertInput(input, location.id, organization.id)
      )
      await this.eventImages.removeUnwanted(eventId, keepImageIds)
      await this.eventImages.saveNew(eventId, files, uploadedImages)
      const images = await this.eventImages.getByEventId(eventId)
      return toEventResponse(row.event, row.location, images, row.faqs)
    } catch (error) {
      await this.eventImages.rollback(uploadedImages)
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException(this.ts.translateError('event.UPDATE_FAILED'))
    }
  }
}
