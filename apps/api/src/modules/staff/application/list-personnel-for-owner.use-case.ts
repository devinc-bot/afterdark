import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findPersonnelByOwnerDocumentId } from '@repo/db'
import type { StaffPersonnelItem } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'
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
