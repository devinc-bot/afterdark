import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { updateProfileStatusByAccountDocumentId } from '@repo/db'
import type { AdminUserTogglableStatus } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class UpdateAdminUserStatusUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(accountDocumentId: string, status: AdminUserTogglableStatus): Promise<void> {
    let updated: boolean

    try {
      updated = await updateProfileStatusByAccountDocumentId(accountDocumentId, status)
    } catch {
      throw new InternalServerErrorException(
        this.ts.translateError('admin.USERS_STATUS_UPDATE_FAILED')
      )
    }

    if (!updated) {
      throw new NotFoundException(this.ts.translateError('admin.USERS_STATUS_UPDATE_NOT_FOUND'))
    }
  }
}
