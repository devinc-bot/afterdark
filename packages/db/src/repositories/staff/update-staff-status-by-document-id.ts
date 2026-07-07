import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { staff } from '../../schema/staff.ts'
import type { StaffStatus } from '@afterdark/types'
import { findStaffOwnershipByDocumentId } from './find-staff-ownership-by-document-id.ts'

export async function updateStaffStatusByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string,
  status: StaffStatus
): Promise<boolean> {
  const ownership = await findStaffOwnershipByDocumentId(staffDocumentId, ownerDocumentId)
  if (!ownership) return false

  await db.update(staff).set({ status }).where(eq(staff.id, ownership.staffId))

  return true
}
