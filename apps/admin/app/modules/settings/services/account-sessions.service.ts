import type { AccountSessionsResponse } from '@repo/types'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export async function getAccountSessions(): Promise<AccountSessionsResponse> {
  try {
    return await api.get(buildApiPath(API_ROUTES.session, API_ROUTES.session.path.list()))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:sessions.loadError'))
  }
}

export async function revokeAccountSession(documentId: string): Promise<void> {
  try {
    await api.delete(buildApiPath(API_ROUTES.session, API_ROUTES.session.path.revoke(documentId)))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:sessions.revokeError'))
  }
}
