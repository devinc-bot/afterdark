import { createSessionService, SessionFetchError } from '@repo/common'
import { CLIENT_APP } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api } from '~/config/api'
import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'

export { SessionFetchError }

const sessionService = createSessionService({
  api,
  app: CLIENT_APP.ADMIN,
  clearAuthSession,
  messages: {
    expired: () => i18n.t('auth:session.expired'),
    loadFallback: () => i18n.t('auth:session.loadFallback'),
  },
})

export const getSession = sessionService.getSession
export const fetchSession = sessionService.fetchSession
export const refreshAuthSession = sessionService.refreshAuthSession
export const logoutAuthSession = sessionService.logoutAuthSession
