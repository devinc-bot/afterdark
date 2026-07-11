import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { createClubWithAddress } from '@afterdark/db'
import type { ClubResponse } from '@afterdark/types'
import { CLUB_IMAGE_MAX_COUNT, type CreateClubInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { toClubResponse, toClubUpsertInput } from '../mappers/club.mapper'
import { validateImageLimit } from '../validators/club.validator'
import { ClubImagesService } from './services/club-images.service'
import { ClubLookupService } from './services/club-lookup.service'

@Injectable()
export class CreateClubUseCase {
  constructor(
    @Inject(ClubLookupService) private readonly clubLookup: ClubLookupService,
    @Inject(ClubImagesService) private readonly clubImages: ClubImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    ownerDocumentId: string,
    input: CreateClubInput,
    files: Express.Multer.File[] = []
  ): Promise<ClubResponse> {
    const ownerId = await this.clubLookup.requireOwnerId(ownerDocumentId)

    validateImageLimit(
      [],
      files,
      this.ts.translateError('club.TOO_MANY_IMAGES', { max: CLUB_IMAGE_MAX_COUNT })
    )

    const uploads = await this.clubImages.upload(files)
    const row = await this.createClubRecord(ownerId, input)
    const images = await this.clubImages.saveNew(row.club.id, files, uploads)

    return toClubResponse(row.club, row.address, images)
  }

  private async createClubRecord(ownerId: number, input: CreateClubInput) {
    try {
      return await createClubWithAddress(ownerId, toClubUpsertInput(input))
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('club.CREATE_FAILED'))
    }
  }
}
