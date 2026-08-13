import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { users } from '../../schema/user.ts'

export async function findUserIdByDocumentId(documentId: string): Promise<number | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.documentId, documentId))
    .limit(1)
  return row?.id ?? null
}
