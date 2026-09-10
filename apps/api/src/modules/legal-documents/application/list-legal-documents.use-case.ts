import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findLatestPublishedLegalDocumentByType, findLegalDocumentDraftByType } from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import { LEGAL_DOCUMENT_TYPE, type LegalDocumentByTypeResponse } from '@repo/types'
import { toLegalDocumentResponse } from './legal-document.mapper'

@Injectable()
export class ListLegalDocumentsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(): Promise<LegalDocumentByTypeResponse[]> {
    try {
      return await Promise.all(
        Object.values(LEGAL_DOCUMENT_TYPE).map(async (type) => {
          const [draft, published] = await Promise.all([
            findLegalDocumentDraftByType(type),
            findLatestPublishedLegalDocumentByType(type),
          ])

          return {
            type,
            draft: draft ? toLegalDocumentResponse(draft) : null,
            published: published ? toLegalDocumentResponse(published) : null,
          }
        })
      )
    } catch {
      throw new InternalServerErrorException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.LIST_FAILED)
      )
    }
  }
}
