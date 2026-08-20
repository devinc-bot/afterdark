import { eq } from 'drizzle-orm'
import type { OwnerStatus } from '@repo/types'
import { db } from '../../client.ts'
import { owners } from '../../schema/owner.ts'

export async function findOwnerStatusByDocumentId(documentId: string): Promise<OwnerStatus | null> {
  const [row] = await db
    .select({ status: owners.status })
    .from(owners)
    .where(eq(owners.documentId, documentId))
    .limit(1)

  return row?.status ?? null
}
