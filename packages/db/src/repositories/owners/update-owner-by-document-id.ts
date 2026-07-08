import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { owners } from '../../schema/owner.ts'
import type { OwnerUpdateInput } from '@afterdark/types'

export async function updateOwnerByDocumentId(
  documentId: string,
  input: OwnerUpdateInput
): Promise<void> {
  await db
    .update(owners)
    .set({
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      birthday: input.birthday,
      nationalId: input.nationalId,
      taxId: input.taxId,
      updatedAt: new Date(),
    })
    .where(eq(owners.documentId, documentId))
}
