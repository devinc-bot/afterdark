import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { findStaleLegalDocumentTypesForAccount } from '@repo/db'
import { AUTH_ERROR_CODE, LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { PendingLegalAcceptanceResponse, UserRole } from '@repo/types'
import {
  findAccountIdForLegalAudience,
  legalDocumentTypesForRole,
} from './legal-document-audience.ts'

@Injectable()
export class GetPendingLegalAcceptanceUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    accountDocumentId: string,
    role: UserRole
  ): Promise<PendingLegalAcceptanceResponse> {
    const types = legalDocumentTypesForRole(role)
    if (!types) {
      throw new BadRequestException(this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.INVALID_TYPES))
    }

    try {
      const accountId = await findAccountIdForLegalAudience(accountDocumentId, role)
      if (accountId === null) {
        throw new NotFoundException(this.ts.translateError(AUTH_ERROR_CODE.USER_NOT_FOUND))
      }

      const staleTypes = await findStaleLegalDocumentTypesForAccount({ accountId, types })
      return { staleTypes }
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
