import type { LegalDocumentType } from '../enums/legal-document.ts'

export interface LegalDocumentResponse {
  documentId: string
  type: LegalDocumentType
  version: string
  title: string
  content: Record<string, unknown>
  isPublished: boolean
  requiresAcceptance: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface LegalDocumentByTypeResponse {
  type: LegalDocumentType
  draft: LegalDocumentResponse | null
  published: LegalDocumentResponse | null
}
