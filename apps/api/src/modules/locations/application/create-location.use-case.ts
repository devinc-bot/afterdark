import { randomUUID } from 'node:crypto'
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { createLocationWithAddress } from '@repo/db'
import type { LocationResponse } from '@repo/types'
import { LOCATION_IMAGE_MAX_COUNT, type CreateLocationInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { toLocationResponse, toLocationUpsertInput } from '../mappers/location.mapper'
import { validateImageLimit } from '../validators/location.validator'
import { LocationImagesService } from './services/location-images.service'
import { LocationLookupService } from './services/location-lookup.service'

@Injectable()
export class CreateLocationUseCase {
  constructor(
    @Inject(LocationLookupService) private readonly locationLookup: LocationLookupService,
    @Inject(LocationImagesService) private readonly locationImages: LocationImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    ownerDocumentId: string,
    input: CreateLocationInput,
    files: Express.Multer.File[] = []
  ): Promise<LocationResponse> {
    const ownerId = await this.locationLookup.requireOwnerId(ownerDocumentId)

    validateImageLimit(
      [],
      files,
      this.ts.translateError('location.TOO_MANY_IMAGES', { max: LOCATION_IMAGE_MAX_COUNT })
    )

    const documentId = randomUUID()
    const uploads = await this.locationImages.upload(files, documentId, 0)

    try {
      const row = await this.createLocationRecord(ownerId, input, documentId)
      const images = await this.locationImages.saveNew(row.location.id, files, uploads)

      return toLocationResponse(row.location, row.address, images)
    } catch (error) {
      await this.locationImages.rollback(uploads)
      throw error
    }
  }

  private async createLocationRecord(
    ownerId: number,
    input: CreateLocationInput,
    documentId: string
  ) {
    try {
      return await createLocationWithAddress(ownerId, toLocationUpsertInput(input), documentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('location.CREATE_FAILED'))
    }
  }
}
