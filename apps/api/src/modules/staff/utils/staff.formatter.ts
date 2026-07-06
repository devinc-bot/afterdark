import type { CurrentStaffRow, OwnerStaffPersonnelRow } from '@afterdark/db'
import { USER_ROLE, type CurrentStaffResponse, type StaffPersonnelItem } from '@afterdark/types'

export function toStaffPersonnelItem(row: OwnerStaffPersonnelRow): StaffPersonnelItem {
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

export function toCurrentStaffResponse(row: CurrentStaffRow): CurrentStaffResponse {
  return {
    sub: row.documentId,
    name: row.name,
    lastName: row.lastName,
    email: row.email,
    avatar: row.avatar,
    phone: row.phone,
    status: row.status,
    role: USER_ROLE.STAFF,
  }
}
