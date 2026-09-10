import { LEGAL_DOCUMENT_TYPE } from '@repo/types'
import { z } from 'zod'

export { LEGAL_DOCUMENT_TYPE }

export const legalDocumentTypeSchema = z.enum([
  LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
  LEGAL_DOCUMENT_TYPE.TERMS_WEB,
  LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
  LEGAL_DOCUMENT_TYPE.PRIVACY_WEB,
])

const legalDocumentContentSchema = z.record(z.string(), z.unknown())

export const saveLegalDocumentDraftSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: legalDocumentContentSchema,
  requiresAcceptance: z.boolean().optional(),
})

/** Path param for GET/PUT/POST `/:type`. Publish has no body; identity is the URL. */
export const publishLegalDocumentSchema = legalDocumentTypeSchema

const uniqueLegalDocumentTypes = (minCount: number) =>
  z
    .array(legalDocumentTypeSchema)
    .min(minCount)
    .refine((types) => new Set(types).size === types.length)

export const acceptLegalDocumentsSchema = z.object({
  types: uniqueLegalDocumentTypes(1),
})

export const pendingLegalAcceptanceResponseSchema = z.object({
  staleTypes: uniqueLegalDocumentTypes(0),
})

export type SaveLegalDocumentDraftInput = z.infer<typeof saveLegalDocumentDraftSchema>
export type PublishLegalDocumentInput = z.infer<typeof publishLegalDocumentSchema>
export type AcceptLegalDocumentsInput = z.infer<typeof acceptLegalDocumentsSchema>
export type PendingLegalAcceptanceResponse = z.infer<typeof pendingLegalAcceptanceResponseSchema>
