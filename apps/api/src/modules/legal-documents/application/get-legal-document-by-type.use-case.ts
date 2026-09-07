import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findLatestPublishedLegalDocumentByType, findLegalDocumentDraftByType } from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { LegalDocumentByTypeResponse, LegalDocumentType } from '@repo/types'
import { toLegalDocumentResponse } from './legal-document.mapper'

@Injectable()
export class GetLegalDocumentByTypeUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(type: LegalDocumentType): Promise<LegalDocumentByTypeResponse> {
    try {
      const [draft, published] = await Promise.all([
        findLegalDocumentDraftByType(type),
        findLatestPublishedLegalDocumentByType(type),
      ])

      return {
        type,
        draft: draft ? toLegalDocumentResponse(draft) : null,
        published: published ? toLegalDocumentResponse(published) : null,
      }
    } catch {
      throw new InternalServerErrorException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.LIST_FAILED)
      )
    }
  }
}
