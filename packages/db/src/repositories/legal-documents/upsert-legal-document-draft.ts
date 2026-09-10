import { and, eq } from 'drizzle-orm'
import type { LegalDocumentType } from '@repo/types'
import { db } from '../../client.ts'
import { legalDocuments, type LegalDocumentSelect } from '../../schema/legal-document.ts'
import { findLegalDocumentDraftByType } from './find-legal-document-draft-by-type.ts'

export type UpsertLegalDocumentDraftInput = {
  type: LegalDocumentType
  title: string
  content: Record<string, unknown>
  requiresAcceptance?: boolean
  version: string
}

export async function upsertLegalDocumentDraft(
  input: UpsertLegalDocumentDraftInput
): Promise<LegalDocumentSelect> {
  const existing = await findLegalDocumentDraftByType(input.type)
  const now = new Date()
  const content = input.content as LegalDocumentSelect['content']

  if (existing) {
    const [updated] = await db
      .update(legalDocuments)
      .set({
        title: input.title,
        content,
        version: input.version,
        requiresAcceptance: input.requiresAcceptance ?? existing.requiresAcceptance,
        updatedAt: now,
      })
      .where(and(eq(legalDocuments.id, existing.id), eq(legalDocuments.isPublished, false)))
      .returning()

    if (updated) {
      return updated
    }
  }

  const [row] = await db
    .insert(legalDocuments)
    .values({
      type: input.type,
      title: input.title,
      content,
      version: input.version,
      requiresAcceptance: input.requiresAcceptance ?? true,
      isPublished: false,
      updatedAt: now,
    })
    .returning()

  if (!row) {
    throw new Error('Legal document draft insert returned no row')
  }

  return row
}
