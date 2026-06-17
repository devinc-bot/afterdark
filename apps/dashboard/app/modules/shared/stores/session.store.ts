import type { CurrentUserResponse } from '@afterdark/types'
import { create } from 'zustand'
import { COOKIE_KEYS } from '~/modules/shared/constants/cookies'
import { SESSION_STATUS, type SessionStatus } from '~/modules/shared/constants/session-status'
import { getCurrentUser } from '~/modules/shared/services/current-user.service'
import { getCookieSync } from '~/modules/shared/utils/cookies.utils'
import { QueryFactoryError } from '~/modules/shared/utils/query-factory'

type SessionState = {
  user: CurrentUserResponse | null
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
      const user = await getCurrentUser()
      set({ user, status: SESSION_STATUS.AUTHENTICATED, error: null })
    } catch (error) {
      const message =
        error instanceof QueryFactoryError
          ? (error.body?.message ?? error.message)
          : SESSION_FALLBACK_ERROR

      set({ user: null, status: SESSION_STATUS.ERROR, error: message })
    }
  },

  clearSession: () => {
    set({ user: null, status: SESSION_STATUS.UNAUTHENTICATED, error: null })
  },
}))
