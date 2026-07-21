import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { deleteLocationById } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import { LocationImagesService } from './services/location-images.service'
import { LocationLookupService } from './services/location-lookup.service'

@Injectable()
export class DeleteLocationUseCase {
  constructor(
    @Inject(LocationLookupService) private readonly locationLookup: LocationLookupService,
    @Inject(LocationImagesService) private readonly locationImages: LocationImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(documentId: string): Promise<void> {
    const locationId = await this.locationLookup.requireLocationId(documentId)

    try {
      await this.locationImages.removeUnwanted(locationId, [])
      await deleteLocationById(locationId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('location.DELETE_FAILED'))
    }
  }
}
