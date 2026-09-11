import { createAccountSessionsClient } from '@repo/common'
import { i18n } from '@repo/i18n/client'
import { api } from '~/config/api'

const client = createAccountSessionsClient({
  api,
  messages: {
    loadError: () => i18n.t('settings:sessions.loadError'),
    revokeError: () => i18n.t('settings:sessions.revokeError'),
  },
})

export const getAccountSessions = client.getAccountSessions
export const revokeAccountSession = client.revokeAccountSession
