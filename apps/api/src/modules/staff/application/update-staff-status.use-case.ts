import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { updateStaffStatusByDocumentId } from '@afterdark/db'
import type { StaffStatus } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'

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
