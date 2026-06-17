import { useEffect } from 'react'
import { SESSION_STATUS } from '~/modules/shared/constants/session-status'
import { useSessionStore } from '~/modules/shared/stores/session.store'

export function useSession() {
  const user = useSessionStore((state) => state.user)
  const status = useSessionStore((state) => state.status)
  const error = useSessionStore((state) => state.error)
  const loadSession = useSessionStore((state) => state.loadSession)
  const clearSession = useSessionStore((state) => state.clearSession)

  useEffect(() => {
    if (status === SESSION_STATUS.IDLE) {
      void loadSession()
    }
  }, [status, loadSession])

  return {
    user,
    status,
    isLoading: status === SESSION_STATUS.IDLE || status === SESSION_STATUS.LOADING,
    isAuthenticated: status === SESSION_STATUS.AUTHENTICATED && user !== null,
    error,
    refresh: loadSession,
    clearSession,
  }
}
