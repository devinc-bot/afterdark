import { and, desc, eq } from 'drizzle-orm'
import type { LegalDocumentType } from '@repo/types'
import { db } from '../../client.ts'
import { legalDocuments, type LegalDocumentSelect } from '../../schema/legal-document.ts'

export async function findLatestPublishedLegalDocumentByType(
  type: LegalDocumentType
): Promise<LegalDocumentSelect | null> {
  const [row] = await db
    .select()
    .from(legalDocuments)
    .where(and(eq(legalDocuments.type, type), eq(legalDocuments.isPublished, true)))
    .orderBy(desc(legalDocuments.publishedAt), desc(legalDocuments.id))
    .limit(1)

  return row ?? null
}
