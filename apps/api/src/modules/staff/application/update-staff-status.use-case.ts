import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { updateStaffStatusByDocumentId } from '@repo/db'
import type { StaffStatus } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class UpdateStaffStatusUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    ownerDocumentId: string,
    staffDocumentId: string,
    status: StaffStatus
  ): Promise<void> {
    let updated: boolean

    try {
      updated = await updateStaffStatusByDocumentId(staffDocumentId, ownerDocumentId, status)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.UPDATE_FAILED'))
    }

    if (!updated) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }
  }
}
