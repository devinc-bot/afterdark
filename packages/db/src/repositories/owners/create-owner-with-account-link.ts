import type { Transaction } from '../../client.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import type { OwnerProfileSeed } from '@afterdark/types'

export async function createOwnerWithAccountLink(
  tx: Transaction,
  accountId: number,
  profile: OwnerProfileSeed
): Promise<string> {
  const [owner] = await tx.insert(owners).values(profile).returning()

  if (!owner) {
    throw new Error('Owner insert returned no row')
  }

  await tx.insert(ownerAccountsLnk).values({
    ownerId: owner.id,
    accountId,
  })

  return owner.documentId
}
