import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { findLatestPublishedLegalDocumentByType } from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { LegalDocumentType, PublicLegalDocumentResponse } from '@repo/types'
import { toPublicLegalDocumentResponse } from './legal-document.mapper'

@Injectable()
export class GetPublishedLegalDocumentByTypeUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(type: LegalDocumentType): Promise<PublicLegalDocumentResponse> {
    try {
      const row = await findLatestPublishedLegalDocumentByType(type)
      if (!row) {
        throw new NotFoundException(
          this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.PUBLISHED_NOT_FOUND)
        )
      }

      return toPublicLegalDocumentResponse(row)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.LIST_FAILED)
      )
    }
  }
}
