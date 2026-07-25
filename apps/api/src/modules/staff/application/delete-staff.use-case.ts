import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { deleteStaffByDocumentId } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class DeleteStaffUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string, staffDocumentId: string): Promise<void> {
    let deleted: boolean

    try {
      deleted = await deleteStaffByDocumentId(staffDocumentId, ownerDocumentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.DELETE_FAILED'))
    }

    if (!deleted) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }
  }
}
