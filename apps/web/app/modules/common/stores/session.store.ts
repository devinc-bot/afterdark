import type { SessionResponse } from '@afterdark/types'
import { create } from 'zustand'
import { i18n } from '@afterdark/i18n/client'
import { getCookieSync } from '@afterdark/common'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { SESSION_STATUS, type SessionStatus } from '~/modules/common/constants/session-status'
import { fetchSession, SessionFetchError } from '~/modules/common/services/session.service'

type SessionState = {
  user: SessionResponse | null
  status: SessionStatus
  error: string | null
  loadSession: () => Promise<void>
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: SESSION_STATUS.IDLE,
  error: null,

  loadSession: async () => {
    const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null

    if (!hasToken) {
      set({ user: null, status: SESSION_STATUS.UNAUTHENTICATED, error: null })
      return
    }

    set({ status: SESSION_STATUS.LOADING, error: null })

    try {
      const user = await fetchSession()
      set({ user, status: SESSION_STATUS.AUTHENTICATED, error: null })
    } catch (error) {
      if (error instanceof SessionFetchError && error.status === 401) {
        set({ user: null, status: SESSION_STATUS.UNAUTHENTICATED, error: null })
        return
      }

      const message = error instanceof Error ? error.message : i18n.t('auth:session.loadFallback')
      set({ user: null, status: SESSION_STATUS.ERROR, error: message })
    }
  },

  clearSession: () => {
    set({ user: null, status: SESSION_STATUS.UNAUTHENTICATED, error: null })
  },
}))
