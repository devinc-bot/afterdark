import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findClubIdByDocumentId, findOwnerIdByDocumentId } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'

@Injectable()
export class ClubLookupService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async requireOwnerId(ownerDocumentId: string): Promise<number> {
    const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)

    if (!ownerId) {
      throw new NotFoundException(this.ts.translateError('owner.NOT_FOUND'))
    }

    return ownerId
  }

  async requireClubId(documentId: string): Promise<number> {
    const clubId = await findClubIdByDocumentId(documentId)

    if (!clubId) {
      throw new NotFoundException(this.ts.translateError('club.NOT_FOUND'))
    }

    return clubId
  }
}
