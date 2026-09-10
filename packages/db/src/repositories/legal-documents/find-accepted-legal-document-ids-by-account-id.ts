import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accountLegalAcceptances } from '../../schema/account-legal-acceptance.ts'

export async function findAcceptedLegalDocumentIdsByAccountId(
  accountId: number
): Promise<number[]> {
  const rows = await db
    .select({ legalDocumentId: accountLegalAcceptances.legalDocumentId })
    .from(accountLegalAcceptances)
    .where(eq(accountLegalAcceptances.accountId, accountId))

  return rows.map((row) => row.legalDocumentId)
}
