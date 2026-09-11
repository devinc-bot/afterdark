import type { ClientApp, LoginResponse, SessionResponse } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'
import { QueryFactoryAuthenticationError, QueryFactoryError } from '../lib/query-factory.ts'
import { toApiServiceError } from './api-service-error.ts'

export class SessionFetchError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'SessionFetchError'
  }
}

type SessionHttp = {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, data: unknown) => Promise<T>
}

export type CreateSessionServiceOptions = {
  api: SessionHttp
  app: ClientApp
  clearAuthSession: () => void
  messages: {
    expired: () => string
    loadFallback: () => string
  }
}

export function createSessionService(options: CreateSessionServiceOptions) {
  const { api, app, clearAuthSession, messages } = options

  function getSession() {
    return api.get<SessionResponse>(buildApiPath(API_ROUTES.session, API_ROUTES.session.path.me()))
  }

  async function fetchSession(): Promise<SessionResponse> {
    try {
      return await getSession()
    } catch (error) {
      if (
        error instanceof QueryFactoryAuthenticationError ||
        (error instanceof QueryFactoryError && error.status === 401)
      ) {
        clearAuthSession()
        throw new SessionFetchError(messages.expired(), 401)
      }

      throw toApiServiceError(error, messages.loadFallback())
    }
  }

  function refreshAuthSession(): Promise<LoginResponse> {
    return api.post<LoginResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.refreshToken()),
      { app }
    )
  }

  function logoutAuthSession(): Promise<void> {
    return api.post<void>(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.logout()), {
      app,
    })
  }

  return {
    getSession,
    fetchSession,
    refreshAuthSession,
    logoutAuthSession,
  }
}
