import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findLocationIdByDocumentId, findOwnerIdByDocumentId } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class LocationLookupService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async requireOwnerId(ownerDocumentId: string): Promise<number> {
    const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)

    if (!ownerId) {
      throw new NotFoundException(this.ts.translateError('owner.NOT_FOUND'))
    }

    return ownerId
  }

  async requireLocationId(documentId: string): Promise<number> {
    const locationId = await findLocationIdByDocumentId(documentId)

    if (!locationId) {
      throw new NotFoundException(this.ts.translateError('location.NOT_FOUND'))
    }

    return locationId
  }
}
