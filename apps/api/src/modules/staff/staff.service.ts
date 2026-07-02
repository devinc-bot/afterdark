import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  deleteStaffByDocumentId,
  findPersonnelByOwnerDocumentId,
  updateStaffStatusByDocumentId,
  type OwnerStaffPersonnelRow,
} from '@afterdark/db'
import type { StaffPersonnelItem, StaffStatus } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'

function toStaffPersonnelItem(row: OwnerStaffPersonnelRow): StaffPersonnelItem {
  return {
    documentId: row.staffDocumentId,
    name: `${row.name} ${row.lastName}`.trim(),
    email: row.email,
    clubId: row.clubDocumentId,
    clubName: row.clubName,
    role: row.role,
    status: row.staffStatus,
    avatar: row.avatar,
    lastActiveAt: row.lastActiveAt,
  }
}

@Injectable()
export class StaffService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async listPersonnelForOwner(ownerDocumentId: string): Promise<StaffPersonnelItem[]> {
    try {
      const rows = await findPersonnelByOwnerDocumentId(ownerDocumentId)
      return rows.map(toStaffPersonnelItem)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('staff.LIST_FAILED'))
    }
  }

  async deleteStaff(ownerDocumentId: string, staffDocumentId: string): Promise<void> {
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

  async updateStaffStatus(
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
