import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { users } from '../../schema/user.ts'
import type { UserProfileUpdateInput } from '@afterdark/types'

export async function updateUserProfileByDocumentId(
  documentId: string,
  input: UserProfileUpdateInput
): Promise<void> {
  await db
    .update(users)
    .set({
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      updatedAt: new Date(),
    })
    .where(eq(users.documentId, documentId))
}
