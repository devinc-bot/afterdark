import type { AccountSessionsResponse } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'
import { toApiServiceError } from './api-service-error.ts'

type AccountSessionsHttp = {
  get: <T>(path: string) => Promise<T>
  delete: <T>(path: string) => Promise<T>
}

export type CreateAccountSessionsClientOptions = {
  api: AccountSessionsHttp
  messages: {
    loadError: () => string
    revokeError: () => string
  }
}

export function createAccountSessionsClient(options: CreateAccountSessionsClientOptions) {
  const { api, messages } = options

  async function getAccountSessions(): Promise<AccountSessionsResponse> {
    try {
      return await api.get(buildApiPath(API_ROUTES.session, API_ROUTES.session.path.list()))
    } catch (error) {
      throw toApiServiceError(error, messages.loadError())
    }
  }

  async function revokeAccountSession(documentId: string): Promise<void> {
    try {
      await api.delete(buildApiPath(API_ROUTES.session, API_ROUTES.session.path.revoke(documentId)))
    } catch (error) {
      throw toApiServiceError(error, messages.revokeError())
    }
  }

  return { getAccountSessions, revokeAccountSession }
}
