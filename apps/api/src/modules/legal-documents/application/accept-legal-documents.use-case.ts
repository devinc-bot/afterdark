import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  findLatestPublishedLegalDocumentByType,
  findStaleLegalDocumentTypesForAccount,
  insertAccountLegalAcceptances,
} from '@repo/db'
import { AUTH_ERROR_CODE, LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type {
  AcceptLegalDocumentsInput,
  PendingLegalAcceptanceResponse,
  UserRole,
} from '@repo/types'
import {
  findAccountIdForLegalAudience,
  legalDocumentTypesForRole,
} from './legal-document-audience.ts'

@Injectable()
export class AcceptLegalDocumentsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    accountDocumentId: string,
    role: UserRole,
    input: AcceptLegalDocumentsInput
  ): Promise<PendingLegalAcceptanceResponse> {
    const audience = legalDocumentTypesForRole(role)
    if (!audience) {
      throw new BadRequestException(this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.INVALID_TYPES))
    }

    const allowed = new Set(audience)
    if (input.types.some((type) => !allowed.has(type))) {
      throw new BadRequestException(this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.INVALID_TYPES))
    }

    try {
      const accountId = await findAccountIdForLegalAudience(accountDocumentId, role)
      if (accountId === null) {
        throw new NotFoundException(this.ts.translateError(AUTH_ERROR_CODE.USER_NOT_FOUND))
      }

      const publishedRows = await Promise.all(
        input.types.map((type) => findLatestPublishedLegalDocumentByType(type))
      )
      const legalDocumentIds: number[] = []
      for (const row of publishedRows) {
        if (!row) {
          throw new NotFoundException(
            this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.PUBLISHED_NOT_FOUND)
          )
        }
        legalDocumentIds.push(row.id)
      }

      await insertAccountLegalAcceptances({
        accountId,
        legalDocumentIds,
      })

      const staleTypes = await findStaleLegalDocumentTypesForAccount({
        accountId,
        types: audience,
      })
      return { staleTypes }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.ACCEPT_FAILED)
      )
    }
  }
}
