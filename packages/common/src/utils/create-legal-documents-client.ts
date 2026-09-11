import {
  LEGAL_DOCUMENT_TYPE,
  type AcceptLegalDocumentsInput,
  type LegalDocumentType,
  type PendingLegalAcceptanceResponse,
  type PublicLegalDocumentResponse,
} from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'
import { QueryFactoryError } from '../lib/index.ts'
import { toApiServiceError } from './api-service-error.ts'

type LegalDocumentsHttp = {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, data: unknown) => Promise<T>
}

export type CreateLegalDocumentsClientOptions = {
  api: LegalDocumentsHttp
  legalAcceptancePath: () => string
  messages: {
    unavailable: () => string
    loadError: () => string
    submitError: () => string
  }
}

const LEGAL_DOCUMENT_TYPES = new Set<string>(Object.values(LEGAL_DOCUMENT_TYPE))

export function createLegalDocumentsClient(options: CreateLegalDocumentsClientOptions) {
  const { api, legalAcceptancePath, messages } = options

  async function getPublishedLegalDocumentByType(
    type: LegalDocumentType
  ): Promise<PublicLegalDocumentResponse> {
    if (!LEGAL_DOCUMENT_TYPES.has(type)) {
      throw new Error(`Unknown legal document type: ${type}`)
    }

    const path = buildApiPath(
      API_ROUTES.legalDocuments,
      API_ROUTES.legalDocuments.path.getPublishedByType(type)
    )

    try {
      return await api.get<PublicLegalDocumentResponse>(path)
    } catch (error) {
      if (error instanceof QueryFactoryError && error.status === 404) {
        throw toApiServiceError(error, messages.unavailable())
      }

      throw toApiServiceError(error, messages.unavailable())
    }
  }

  async function getPendingLegalAcceptance(): Promise<PendingLegalAcceptanceResponse> {
    const path = buildApiPath(
      API_ROUTES.legalDocuments,
      API_ROUTES.legalDocuments.path.getPendingAcceptance()
    )

    try {
      return await api.get<PendingLegalAcceptanceResponse>(path)
    } catch (error) {
      throw toApiServiceError(error, messages.loadError())
    }
  }

  async function acceptLegalDocuments(
    types: AcceptLegalDocumentsInput['types']
  ): Promise<PendingLegalAcceptanceResponse> {
    const path = buildApiPath(API_ROUTES.legalDocuments, API_ROUTES.legalDocuments.path.accept())

    try {
      return await api.post<PendingLegalAcceptanceResponse>(path, { types })
    } catch (error) {
      throw toApiServiceError(error, messages.submitError())
    }
  }

  async function resolvePostAuthPath(fallback: string): Promise<string> {
    try {
      const pending = await getPendingLegalAcceptance()
      if (pending.staleTypes.length > 0) {
        return legalAcceptancePath()
      }
      return fallback
    } catch {
      return fallback
    }
  }

  return {
    getPublishedLegalDocumentByType,
    getPendingLegalAcceptance,
    acceptLegalDocuments,
    resolvePostAuthPath,
  }
}
