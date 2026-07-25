import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findUserProfileByDocumentId, updateUserProfileByDocumentId } from '@repo/db'
import type { CurrentUserResponse } from '@repo/types'
import type { UpdateCurrentUserProfileInput } from '@repo/validators'
import { AUTH_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { GetCurrentUserUseCase } from './get-current-user.use-case'

@Injectable()
export class UpdateCurrentUserUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(GetCurrentUserUseCase) private readonly getCurrentUser: GetCurrentUserUseCase
  ) {}

  async execute(
    documentId: string,
    input: UpdateCurrentUserProfileInput
  ): Promise<CurrentUserResponse> {
    const row = await findUserProfileByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError(AUTH_ERROR_CODE.SESSION_NOT_FOUND))
    }

    await updateUserProfileByDocumentId(documentId, {
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
    })

    return this.getCurrentUser.execute(documentId)
  }
}
