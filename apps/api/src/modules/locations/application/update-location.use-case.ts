import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findLocationByDocumentId,
  findLocationImageAssetsByLocationIds,
  updateLocationWithAddress,
} from '@afterdark/db'
import type { LocationResponse } from '@afterdark/types'
import { LOCATION_IMAGE_MAX_COUNT, type UpdateLocationInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { toLocationResponse, toLocationUpsertInput } from '../mappers/location.mapper'
import { assertValidKeepImageIds, validateImageLimit } from '../validators/location.validator'
import { LocationImagesService } from './services/location-images.service'
import { LocationLookupService } from './services/location-lookup.service'

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject(LocationLookupService) private readonly locationLookup: LocationLookupService,
    @Inject(LocationImagesService) private readonly locationImages: LocationImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    documentId: string,
    input: UpdateLocationInput,
    files: Express.Multer.File[] = [],
    keepImageIds: string[] = []
  ): Promise<LocationResponse> {
    const locationId = await this.locationLookup.requireLocationId(documentId)
    const existing = await findLocationByDocumentId(documentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('location.NOT_FOUND'))
    }

    const currentImages = await findLocationImageAssetsByLocationIds([locationId])

    assertValidKeepImageIds(
      currentImages.map(({ asset }) => asset.documentId),
      keepImageIds,
      this.ts.translateError('location.INVALID_IMAGE_IDS')
    )
    validateImageLimit(
      keepImageIds,
      files,
      this.ts.translateError('location.TOO_MANY_IMAGES', { max: LOCATION_IMAGE_MAX_COUNT })
    )

    const uploadedImages = await this.locationImages.upload(files)

    try {
      const locationData = await updateLocationWithAddress(
        documentId,
        locationId,
        toLocationUpsertInput(input)
      )
      await this.locationImages.removeUnwanted(locationId, keepImageIds)
      await this.locationImages.saveNew(locationId, files, uploadedImages)

      const images = await this.locationImages.getByLocationId(locationId)

      return toLocationResponse(locationData.location, locationData.address, images)
    } catch (error) {
      await this.locationImages.rollback(uploadedImages)
      throw error
    }
  }
}
