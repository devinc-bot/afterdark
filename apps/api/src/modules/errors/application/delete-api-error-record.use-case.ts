import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { deleteApiErrorRecordByDocumentId } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class DeleteApiErrorRecordUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(documentId: string): Promise<void> {
    let deleted: boolean

    try {
      deleted = await deleteApiErrorRecordByDocumentId(documentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('admin.ERRORS_DELETE_FAILED'))
    }

    if (!deleted) {
      throw new NotFoundException(this.ts.translateError('admin.ERRORS_DELETE_NOT_FOUND'))
    }
  }
}
