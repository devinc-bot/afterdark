import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { deleteClubById } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import { ClubImagesService } from './services/club-images.service'
import { ClubLookupService } from './services/club-lookup.service'

@Injectable()
export class DeleteClubUseCase {
  constructor(
    @Inject(ClubLookupService) private readonly clubLookup: ClubLookupService,
    @Inject(ClubImagesService) private readonly clubImages: ClubImagesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(documentId: string): Promise<void> {
    const clubId = await this.clubLookup.requireClubId(documentId)

    try {
      await this.clubImages.removeUnwanted(clubId, [])
      await deleteClubById(clubId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('club.DELETE_FAILED'))
    }
  }
}
