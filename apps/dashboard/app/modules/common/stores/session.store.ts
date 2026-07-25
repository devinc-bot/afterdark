import type { SessionResponse } from '@repo/types'
import { create } from 'zustand'
import { i18n } from '@repo/i18n/client'
import { getCookieSync, SESSION_STATUS, type SessionStatus } from '@repo/common'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { fetchSession } from '~/modules/common/services/session.service'

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
      const message = error instanceof Error ? error.message : i18n.t('auth:session.loadFallback')

      set({ user: null, status: SESSION_STATUS.ERROR, error: message })
    }
  },

  clearSession: () => {
    set({ user: null, status: SESSION_STATUS.UNAUTHENTICATED, error: null })
  },
}))
