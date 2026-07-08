import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { staff } from '../../schema/staff.ts'
import type { StaffProfileUpdateInput } from '@afterdark/types'

export async function updateStaffProfileByDocumentId(
  documentId: string,
  input: StaffProfileUpdateInput
): Promise<void> {
  await db
    .update(staff)
    .set({
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      updatedAt: new Date(),
    })
    .where(eq(staff.documentId, documentId))
}
