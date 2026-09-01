import {
  API_ROUTES,
  buildApiPath,
  QueryFactoryAuthenticationError,
  QueryFactoryError,
  toApiServiceError,
} from '@repo/common'
import { CLIENT_APP, type LoginResponse, type SessionResponse } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api } from '~/config/api'
import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'

export class SessionFetchError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'SessionFetchError'
  }
}

export async function fetchSession(): Promise<SessionResponse> {
  try {
    return await api.get<SessionResponse>(
      buildApiPath(API_ROUTES.session, API_ROUTES.session.path.me())
    )
  } catch (error) {
    if (
      error instanceof QueryFactoryAuthenticationError ||
      (error instanceof QueryFactoryError && error.status === 401)
    ) {
      clearAuthSession()
      throw new SessionFetchError(i18n.t('auth:session.expired'), 401)
    }

    throw toApiServiceError(error, i18n.t('auth:session.loadFallback'))
  }
}

export function refreshAuthSession(): Promise<LoginResponse> {
  return api.post<LoginResponse>(
    buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.refreshToken()),
    { app: CLIENT_APP.WEB }
  )
}

export function logoutAuthSession(): Promise<void> {
  return api.post<void>(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.logout()), {
    app: CLIENT_APP.WEB,
  })
}
