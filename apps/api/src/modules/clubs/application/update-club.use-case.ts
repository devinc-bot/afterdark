import { Inject, Injectable } from '@nestjs/common'
import { findClubImageAssetsByClubIds, updateClubWithAddress } from '@afterdark/db'
import type { ClubResponse } from '@afterdark/types'
import { CLUB_IMAGE_MAX_COUNT, type UpdateClubInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { toClubResponse, toClubUpsertInput } from '../mappers/club.mapper'
import { assertValidKeepImageIds, validateImageLimit } from '../validators/club.validator'
import { ClubImagesService } from './services/club-images.service'
import { ClubLookupService } from './services/club-lookup.service'

@Injectable()
export class UpdateClubUseCase {
  constructor(
    @Inject(ClubLookupService) private readonly clubLookup: ClubLookupService,
    @Inject(ClubImagesService) private readonly clubImages: ClubImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    documentId: string,
    input: UpdateClubInput,
    files: Express.Multer.File[] = [],
    keepImageIds: string[] = []
  ): Promise<ClubResponse> {
    const clubId = await this.clubLookup.requireClubId(documentId)
    const currentImages = await findClubImageAssetsByClubIds([clubId])

    assertValidKeepImageIds(
      currentImages.map(({ asset }) => asset.documentId),
      keepImageIds,
      this.ts.translateError('club.INVALID_IMAGE_IDS')
    )
    validateImageLimit(
      keepImageIds,
      files,
      this.ts.translateError('club.TOO_MANY_IMAGES', { max: CLUB_IMAGE_MAX_COUNT })
    )

    const uploadedImages = await this.clubImages.upload(files)

    try {
      const clubData = await updateClubWithAddress(documentId, clubId, toClubUpsertInput(input))
      await this.clubImages.removeUnwanted(clubId, keepImageIds)
      await this.clubImages.saveNew(clubId, files, uploadedImages)

      const images = await this.clubImages.getByClubId(clubId)

      return toClubResponse(clubData.club, clubData.address, images)
    } catch (error) {
      await this.clubImages.rollback(uploadedImages)
      throw error
    }
  }
}
