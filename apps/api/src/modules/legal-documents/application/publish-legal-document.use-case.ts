import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { publishLegalDocumentDraftByType, type LegalDocumentSelect } from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { LegalDocumentResponse, LegalDocumentType } from '@repo/types'
import { toLegalDocumentResponse } from './legal-document.mapper'

@Injectable()
export class PublishLegalDocumentUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(type: LegalDocumentType): Promise<LegalDocumentResponse> {
    let row: LegalDocumentSelect | null

    try {
      row = await publishLegalDocumentDraftByType(type)
    } catch {
      throw new InternalServerErrorException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.PUBLISH_FAILED)
      )
    }

    if (!row) {
      throw new BadRequestException(this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.NO_DRAFT))
    }

    return toLegalDocumentResponse(row)
  }
}
