import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findCurrentStaffByDocumentId, updateStaffProfileByDocumentId } from '@afterdark/db'
import { STAFF_STATUS, type CurrentStaffResponse } from '@afterdark/types'
import type { UpdateCurrentStaffInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
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
