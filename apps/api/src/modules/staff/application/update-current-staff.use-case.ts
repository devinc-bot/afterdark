import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findCurrentStaffByDocumentId, updateStaffProfileByDocumentId } from '@repo/db'
import { STAFF_STATUS, type CurrentStaffResponse } from '@repo/types'
import type { UpdateCurrentStaffInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { GetCurrentStaffUseCase } from './get-current-staff.use-case'

@Injectable()
export class UpdateCurrentStaffUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(GetCurrentStaffUseCase) private readonly getCurrentStaff: GetCurrentStaffUseCase
  ) {}

  async execute(documentId: string, input: UpdateCurrentStaffInput): Promise<CurrentStaffResponse> {
    const row = await findCurrentStaffByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('staff.NOT_FOUND'))
    }

    if (row.status !== STAFF_STATUS.ACTIVE) {
      throw new ForbiddenException(this.ts.translateError('staff.INACTIVE'))
    }

    await updateStaffProfileByDocumentId(documentId, {
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
    })

    return this.getCurrentStaff.execute(documentId)
  }
}
