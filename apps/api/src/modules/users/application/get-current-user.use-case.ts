import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findUserProfileByDocumentId } from '@afterdark/db'
import type { CurrentUserResponse } from '@afterdark/types'
import { AUTH_ERROR_CODE } from '@afterdark/i18n/constants'
import { TranslationService } from '@afterdark/i18n/server'
import { toCurrentUserResponse } from '../mappers/user.mapper'

@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(documentId: string): Promise<CurrentUserResponse> {
    const row = await findUserProfileByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError(AUTH_ERROR_CODE.SESSION_NOT_FOUND))
    }

    return toCurrentUserResponse(row)
  }
}
