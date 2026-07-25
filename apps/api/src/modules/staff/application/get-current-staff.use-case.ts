import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findCurrentStaffByDocumentId } from '@repo/db'
import type { CurrentStaffResponse } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'
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
