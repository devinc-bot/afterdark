import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findPersonnelByOwnerDocumentId } from '@afterdark/db'
import type { StaffPersonnelItem } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'
import { toStaffPersonnelItem } from '../mappers/staff.mapper'

@Injectable()
export class ListPersonnelForOwnerUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string): Promise<StaffPersonnelItem[]> {
    try {
      const rows = await findPersonnelByOwnerDocumentId(ownerDocumentId)
      return rows.map(toStaffPersonnelItem)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.LIST_FAILED'))
    }
  }
}
