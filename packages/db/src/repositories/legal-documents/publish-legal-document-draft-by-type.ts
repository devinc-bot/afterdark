import { and, eq } from 'drizzle-orm'
import type { LegalDocumentType } from '@repo/types'
import { db } from '../../client.ts'
import { legalDocuments, type LegalDocumentSelect } from '../../schema/legal-document.ts'

export async function publishLegalDocumentDraftByType(
  type: LegalDocumentType
): Promise<LegalDocumentSelect | null> {
  const now = new Date()
  const [row] = await db
    .update(legalDocuments)
    .set({
      isPublished: true,
      publishedAt: now,
      updatedAt: now,
    })
    .where(and(eq(legalDocuments.type, type), eq(legalDocuments.isPublished, false)))
    .returning()

  return row ?? null
}
