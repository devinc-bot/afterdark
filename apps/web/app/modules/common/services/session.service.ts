import { API_ROUTES, buildApiPath, QueryFactoryError, toApiServiceError } from '@repo/common'
import type { SessionResponse } from '@repo/types'
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
    if (error instanceof QueryFactoryError && error.status === 401) {
      clearAuthSession()
      throw new SessionFetchError(i18n.t('auth:session.expired'), 401)
    }

    throw toApiServiceError(error, i18n.t('auth:session.loadFallback'))
  }
}
