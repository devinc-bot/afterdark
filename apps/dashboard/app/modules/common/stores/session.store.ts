import type { SessionResponse } from '@afterdark/types'
import { create } from 'zustand'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { SESSION_STATUS, type SessionStatus } from '~/modules/common/constants/session-status'
import { fetchSession } from '~/modules/common/services/session.service'
import { getCookieSync } from '~/modules/common/utils/cookies.utils'

type SessionState = {
  user: SessionResponse | null
  status: SessionStatus
  error: string | null
  loadSession: () => Promise<void>
  clearSession: () => void
}

const SESSION_FALLBACK_ERROR = 'No pudimos cargar tu perfil. Intentá de nuevo en unos minutos.'

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
      const message = error instanceof Error ? error.message : SESSION_FALLBACK_ERROR

      set({ user: null, status: SESSION_STATUS.ERROR, error: message })
    }
  },

  clearSession: () => {
    set({ user: null, status: SESSION_STATUS.UNAUTHENTICATED, error: null })
  },
}))
