import type { LegalDocumentSelect } from '@repo/db'
import type {
  LegalDocumentResponse,
  LegalDocumentType,
  PublicLegalDocumentResponse,
} from '@repo/types'

export function toLegalDocumentResponse(row: LegalDocumentSelect): LegalDocumentResponse {
  return {
    documentId: row.documentId,
    type: row.type as LegalDocumentType,
    version: row.version,
    title: row.title,
    content: row.content as Record<string, unknown>,
    isPublished: row.isPublished,
    requiresAcceptance: row.requiresAcceptance,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toPublicLegalDocumentResponse(
  row: LegalDocumentSelect
): PublicLegalDocumentResponse {
  return {
    documentId: row.documentId,
    type: row.type as LegalDocumentType,
    version: row.version,
    title: row.title,
    content: row.content as Record<string, unknown>,
    publishedAt: row.publishedAt ?? row.createdAt,
  }
}
