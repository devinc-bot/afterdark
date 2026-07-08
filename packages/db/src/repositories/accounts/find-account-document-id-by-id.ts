import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'

export async function findAccountDocumentIdById(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: accounts.documentId })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1)

  return row?.documentId ?? null
}
