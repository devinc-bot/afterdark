import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'

let clearSessionState: (() => void) | null = null

export function registerSessionStateCleanup(cleanup: () => void): void {
  clearSessionState = cleanup
}

export function clearLocalSession(): void {
  clearAuthSession()
  clearSessionState?.()
}
