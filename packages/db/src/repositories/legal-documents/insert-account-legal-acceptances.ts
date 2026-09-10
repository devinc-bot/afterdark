import { db } from '../../client.ts'
import { accountLegalAcceptances } from '../../schema/account-legal-acceptance.ts'

export async function insertAccountLegalAcceptances(input: {
  accountId: number
  legalDocumentIds: readonly number[]
}): Promise<void> {
  if (input.legalDocumentIds.length === 0) {
    throw new Error('Account legal acceptances require at least one legal document id')
  }

  await db
    .insert(accountLegalAcceptances)
    .values(
      input.legalDocumentIds.map((legalDocumentId) => ({
        accountId: input.accountId,
        legalDocumentId,
      }))
    )
    .onConflictDoNothing({
      target: [accountLegalAcceptances.accountId, accountLegalAcceptances.legalDocumentId],
    })
}
