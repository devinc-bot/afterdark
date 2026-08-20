import type { QueryClient } from '@tanstack/react-query'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { clearAuthSession } from './auth-storage.utils'

export function clearAuthenticatedState(queryClient: QueryClient): void {
  clearAuthSession()
  useSessionStore.getState().clearSession()
  queryClient.clear()
}
