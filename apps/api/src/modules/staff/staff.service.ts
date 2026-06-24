import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { findPersonnelByOwnerDocumentId, type OwnerStaffPersonnelRow } from '@afterdark/db'
import type { StaffPersonnelItem } from '@afterdark/types'
import { STAFF_MESSAGE } from './staff.constants'

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
  async listPersonnelForOwner(ownerDocumentId: string): Promise<StaffPersonnelItem[]> {
    try {
      const rows = await findPersonnelByOwnerDocumentId(ownerDocumentId)
      return rows.map(toStaffPersonnelItem)
    } catch {
      throw new InternalServerErrorException(STAFF_MESSAGE.LIST_FAILED)
    }
  }
}
