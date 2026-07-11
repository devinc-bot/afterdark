import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findCurrentStaffByDocumentId } from '@afterdark/db'
import type { CurrentStaffResponse } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'
import { toCurrentStaffResponse } from '../mappers/staff.mapper'

@Injectable()
export class GetCurrentStaffUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(documentId: string): Promise<CurrentStaffResponse> {
    const row = await findCurrentStaffByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }

    return toCurrentStaffResponse(row)
  }
}
